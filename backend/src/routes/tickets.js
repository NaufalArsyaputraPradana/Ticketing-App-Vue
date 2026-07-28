const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { verifyToken } = require('../middleware/auth');

router.post('/scan', verifyToken, ticketController.scanTicket);

module.exports = router;
