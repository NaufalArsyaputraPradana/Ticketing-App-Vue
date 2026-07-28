const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankController');
const { verifyToken } = require('../middleware/auth');

// Public route to fetch banks for a specific EO during checkout
router.get('/organizer/:organizer_id', bankController.getBanksByOrganizer);

// EO routes
router.get('/my-banks', verifyToken, bankController.getMyBanks);
router.post('/', verifyToken, bankController.createBank);
router.put('/:id', verifyToken, bankController.updateBank);
router.delete('/:id', verifyToken, bankController.deleteBank);

module.exports = router;
