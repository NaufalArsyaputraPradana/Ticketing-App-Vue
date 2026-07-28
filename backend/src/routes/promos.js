const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promoController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, promoController.getPromos);
router.post('/', verifyToken, promoController.createPromo);
router.post('/validate', promoController.validatePromo);

module.exports = router;
