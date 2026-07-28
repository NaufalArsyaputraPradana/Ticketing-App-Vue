const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');
const favoriteRoutes = require('./routes/favorites');
const bankRoutes = require('./routes/banks');
const promoRoutes = require('./routes/promos');
const ticketRoutes = require('./routes/tickets');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/public', express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'TicketFlow API is running' });
});

module.exports = app;
