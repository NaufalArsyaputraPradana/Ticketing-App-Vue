const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, favoriteController.getFavorites);
router.post('/toggle', verifyToken, favoriteController.toggleFavorite);

module.exports = router;
