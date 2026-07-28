const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getPromos = async (req, res) => {
  try {
    const userRole = req.user.role;
    let promos;
    if (userRole === 'admin') {
      promos = await prisma.promoCode.findMany({ include: { event: true } });
    } else if (userRole === 'organizer') {
      promos = await prisma.promoCode.findMany({ 
        where: { organizer_id: req.user.id },
        include: { event: true }
      });
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(promos);
  } catch (error) {
    console.error('Error fetching promos:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createPromo = async (req, res) => {
  try {
    const { code, discount_type, discount_value, event_id, valid_from, valid_until, usage_limit } = req.body;
    
    const existing = await prisma.promoCode.findUnique({ where: { code } });
    if (existing) return res.status(400).json({ message: 'Kode promo sudah ada' });

    const newPromo = await prisma.promoCode.create({
      data: {
        code,
        discount_type,
        discount_value,
        event_id: event_id || null,
        valid_from: valid_from ? new Date(valid_from) : null,
        valid_until: valid_until ? new Date(valid_until) : null,
        usage_limit: usage_limit || null,
        organizer_id: req.user.id
      }
    });
    res.status(201).json(newPromo);
  } catch (error) {
    console.error('Error creating promo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.validatePromo = async (req, res) => {
  try {
    const { code, event_id } = req.body;
    const promo = await prisma.promoCode.findUnique({ where: { code } });
    
    if (!promo) return res.status(404).json({ message: 'Kode promo tidak ditemukan' });
    
    if (promo.event_id && promo.event_id !== event_id) {
       return res.status(400).json({ message: 'Promo tidak berlaku untuk event ini' });
    }

    const now = new Date();
    if (promo.valid_from && now < promo.valid_from) return res.status(400).json({ message: 'Promo belum mulai berlaku' });
    if (promo.valid_until && now > promo.valid_until) return res.status(400).json({ message: 'Promo sudah kadaluarsa' });

    if (promo.usage_limit && promo.used_count >= promo.usage_limit) return res.status(400).json({ message: 'Batas penggunaan promo habis' });

    res.json({
      valid: true,
      promo: {
        id: promo.id,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value
      }
    });
  } catch (error) {
    console.error('Error validating promo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
