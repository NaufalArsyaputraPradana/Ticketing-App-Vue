const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all favorites for the logged-in user
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { user_id: req.user.id },
      include: {
        event: {
          include: { category: true }
        }
      }
    });
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Toggle a favorite for an event
exports.toggleFavorite = async (req, res) => {
  try {
    const { event_id } = req.body;
    
    // Check if it already exists
    const existing = await prisma.favorite.findFirst({
      where: {
        user_id: req.user.id,
        event_id: parseInt(event_id)
      }
    });

    if (existing) {
      // Remove it
      await prisma.favorite.delete({ where: { id: existing.id } });
      res.json({ isFavorite: false, message: 'Removed from favorites' });
    } else {
      // Add it
      await prisma.favorite.create({
        data: {
          user_id: req.user.id,
          event_id: parseInt(event_id)
        }
      });
      res.json({ isFavorite: true, message: 'Added to favorites' });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
