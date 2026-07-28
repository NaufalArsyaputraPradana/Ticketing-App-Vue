const express = require('express');
const { getAllUsers, getAllTransactions, getPlatformStats } = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken, isAdmin);

router.get('/users', getAllUsers);
router.get('/transactions', getAllTransactions);
router.get('/stats', getPlatformStats);

module.exports = router;
