const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.scanTicket = async (req, res) => {
  try {
    const { ticket_code } = req.body;
    
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { ticket_code },
      include: {
        transaction_item: {
          include: {
            ticket_category: {
              include: {
                event: true
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Tiket tidak ditemukan' });
    }

    if (ticket.transaction_item.ticket_category.event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak berhak scan tiket event ini' });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({ message: 'Tiket sudah digunakan!' });
    }

    if (ticket.status !== 'active') {
      return res.status(400).json({ message: 'Status tiket tidak valid' });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'used',
        checked_in_at: new Date()
      }
    });

    res.json({
      message: 'Scan berhasil, tiket valid!',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Error scanning ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
