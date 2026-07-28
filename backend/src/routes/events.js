const express = require('express');
const { getAllEvents, getEventById, getMyEvents, createEvent, addTicketCategory, checkinTicket } = require('../controllers/eventController');
const { verifyToken, isOrganizer } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public Routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Organizer Routes
router.get('/eo/my-events', verifyToken, isOrganizer, getMyEvents);
router.post('/eo/create', verifyToken, isOrganizer, upload.single('banner_image'), createEvent);
router.post('/eo/:event_id/tickets', verifyToken, isOrganizer, addTicketCategory);
router.post('/eo/checkin', verifyToken, isOrganizer, checkinTicket);

module.exports = router;
