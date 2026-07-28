const prisma = require('../config/prisma');
const mailer = require('../utils/mailer');

const checkout = async (req, res) => {
  try {
    const { items, paymentMethod, promo_code_id } = req.body; 
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Tidak ada tiket yang dipilih.' });
    }

    const userId = req.user.id;
    const bookingCode = 'BK-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);
    
    let totalAmount = 0;
    let discountAmount = 0;
    const transactionItemsData = [];

    const result = await prisma.$transaction(async (tx) => {
      // 1. Validasi & Kalkulasi harga
      let event_id = null;
      for (const item of items) {
        const ticketCat = await tx.ticketCategory.findUnique({
          where: { id: item.ticket_category_id }
        });

        if (!ticketCat) throw new Error(`Kategori tiket ${item.ticket_category_id} tidak valid.`);
        if (ticketCat.quota - ticketCat.sold < item.quantity) {
          throw new Error(`Stok tiket ${ticketCat.name} tidak mencukupi. Sisa: ${ticketCat.quota - ticketCat.sold}`);
        }
        
        event_id = ticketCat.event_id; // assuming all items are from the same event for simplicity

        const subtotal = Number(ticketCat.price) * item.quantity;
        totalAmount += subtotal;

        transactionItemsData.push({
          ticket_category_id: ticketCat.id,
          holder_name: item.holder_name || req.user.name,
          holder_email: item.holder_email || req.user.email,
          quantity: item.quantity,
          subtotal: subtotal
        });
      }

      // Handle promo code
      if (promo_code_id) {
        const promo = await tx.promoCode.findUnique({ where: { id: promo_code_id } });
        if (promo) {
          if (promo.discount_type === 'percentage') {
            discountAmount = (totalAmount * Number(promo.discount_value)) / 100;
          } else {
            discountAmount = Number(promo.discount_value);
          }
          if (discountAmount > totalAmount) discountAmount = totalAmount;

          // Increment usage
          await tx.promoCode.update({
            where: { id: promo.id },
            data: { used_count: { increment: 1 } }
          });
        }
      }

      const finalAmount = totalAmount - discountAmount;

      // 2. Buat Transaksi (Status Pending)
      const transaction = await tx.transaction.create({
        data: {
          user_id: userId,
          booking_code: bookingCode,
          total_amount: finalAmount,
          payment_method: paymentMethod || 'MANUAL_TRANSFER',
          payment_status: 'pending', 
          promo_code_id: promo_code_id || null,
          discount_amount: discountAmount,
          items: {
            create: transactionItemsData
          }
        },
        include: { items: true }
      });

      return transaction;
    });

    res.status(201).json({ message: 'Checkout berhasil, harap upload bukti pembayaran!', transaction: result });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Gagal memproses transaksi.' });
  }
};

const uploadPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: 'File bukti pembayaran harus diunggah.' });
    
    // In a real app, this should be uploaded to S3 or Cloudinary. We will use a local static path.
    const fileUrl = `/public/uploads/${req.file.filename}`;

    const transaction = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: { payment_proof: fileUrl }
    });

    res.json({ message: 'Bukti pembayaran berhasil diunggah', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const verifyTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'paid' or 'failed'

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: { 
        items: {
          include: { ticket_category: { include: { event: true } } }
        },
        user: true
      }
    });

    if (!transaction) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });

    // Cek otorisasi EO
    const eventOrganizerId = transaction.items[0]?.ticket_category?.event?.organizer_id;
    if (eventOrganizerId !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak berhak memverifikasi transaksi ini.' });
    }

    if (status === 'paid') {
      const ticketsToCreate = [];
      const eventTitle = transaction.items[0].ticket_category.event.title;

      // Update stok and generate tickets
      await prisma.$transaction(async (tx) => {
        for (const trxItem of transaction.items) {
          // Update Stok
          await tx.ticketCategory.update({
            where: { id: trxItem.ticket_category_id },
            data: { sold: { increment: trxItem.quantity } }
          });

          for (let i = 0; i < trxItem.quantity; i++) {
            const ticketCode = 'TC-' + transaction.id + '-' + trxItem.id + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            ticketsToCreate.push({
              transaction_item_id: trxItem.id,
              ticket_code: ticketCode,
              status: 'active'
            });
          }
        }
        await tx.ticket.createMany({ data: ticketsToCreate });
      });

      const generatedTickets = await prisma.ticket.findMany({
        where: { transaction_item: { transaction_id: transaction.id } },
        include: { transaction_item: { include: { ticket_category: true } } }
      });

      // Send email asynchronously
      mailer.sendTicketEmail(transaction.user.email, transaction.user.name, eventTitle, generatedTickets);

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { payment_status: 'paid', paid_at: new Date() }
      });

      res.json({ message: 'Transaksi disetujui, tiket diterbitkan!' });
    } else {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { payment_status: 'failed' }
      });
      res.json({ message: 'Transaksi ditolak.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getMyTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { user_id: req.user.id },
      include: {
        items: {
          include: { ticket_category: { include: { event: true } } }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role === 'organizer') {
      whereClause = {
        items: {
          some: {
            ticket_category: {
              event: {
                organizer_id: req.user.id
              }
            }
          }
        }
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: { ticket_category: { include: { event: true } } }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

const getMyTickets = async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        transaction_item: {
          transaction: { user_id: req.user.id }
        }
      },
      include: {
        transaction_item: {
          include: { ticket_category: { include: { event: true } } }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat tiket.' });
  }
};

module.exports = { checkout, uploadPaymentProof, verifyTransaction, getMyTransactions, getAllTransactions, getMyTickets };
