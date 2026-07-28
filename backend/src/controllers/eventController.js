const prisma = require('../config/prisma');

// PUBLIC API
const getAllEvents = async (req, res) => {
  try {
    const { search } = req.query;
    
    const whereClause = { status: 'published' };
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { venue_name: { contains: search } },
        { city: { contains: search } }
      ];
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        category: true,
        organizer: { select: { name: true } },
        ticket_categories: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil data event.' });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true,
        organizer: { select: { name: true } },
        ticket_categories: true
      }
    });
    if (!event) return res.status(404).json({ message: 'Event tidak ditemukan.' });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil detail event.' });
  }
};

// EO API
const getMyEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { organizer_id: req.user.id },
      include: { ticket_categories: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil event EO.' });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, venue_name, city, start_date, end_date, category_id } = req.body;
    
    // Process image path if uploaded
    let banner_image = req.body.banner_image; // fallback to URL if provided
    if (req.file) {
      // Create full URL to access image
      const protocol = req.protocol;
      const host = req.get('host');
      banner_image = `${protocol}://${host}/public/uploads/${req.file.filename}`;
    }

    // Auto-generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const event = await prisma.event.create({
      data: {
        organizer_id: req.user.id,
        category_id: parseInt(category_id) || 1, // Default fallback
        title,
        slug,
        description,
        venue_name,
        city,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        banner_image,
        status: 'published' // Auto publish for simplicity
      }
    });
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat event.' });
  }
};

const addTicketCategory = async (req, res) => {
  try {
    const { event_id } = req.params;
    const { name, price, quota, description } = req.body;

    const event = await prisma.event.findFirst({
      where: { id: parseInt(event_id), organizer_id: req.user.id }
    });

    if (!event) return res.status(403).json({ message: 'Akses ditolak.' });

    const ticketCategory = await prisma.ticketCategory.create({
      data: {
        event_id: parseInt(event_id),
        name,
        description,
        price: parseFloat(price),
        quota: parseInt(quota)
      }
    });

    res.status(201).json(ticketCategory);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambahkan tiket.' });
  }
};

const checkinTicket = async (req, res) => {
  try {
    const { ticket_code } = req.body;
    
    const ticket = await prisma.ticket.findFirst({
      where: { ticket_code },
      include: {
        transaction_item: {
          include: { ticket_category: { include: { event: true } } }
        }
      }
    });

    if (!ticket) return res.status(404).json({ message: 'Tiket tidak ditemukan.' });
    if (ticket.transaction_item.ticket_category.event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak berhak memeriksa tiket event ini.' });
    }
    if (ticket.status === 'used') {
      return res.status(400).json({ message: 'Tiket sudah digunakan sebelumnya!' });
    }

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'used' }
    });

    res.json({ message: 'Check-in berhasil!', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memproses check-in.' });
  }
};

module.exports = { getAllEvents, getEventById, getMyEvents, createEvent, addTicketCategory, checkinTicket };
