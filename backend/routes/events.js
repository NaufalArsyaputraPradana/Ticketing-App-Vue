const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        category: true,
        location: true,
        tickets: {
          include: {
            ticket_type: true
          }
        }
      },
      orderBy: {
        waktu: 'asc'
      }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get a single event
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        location: true,
        tickets: {
          include: {
            ticket_type: true
          }
        },
        user: {
          select: { name: true }
        }
      }
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

module.exports = router;
