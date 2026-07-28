const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyToken, isOrganizer } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup multer for payment proof upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, 'payment-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// User routes
router.post('/checkout', verifyToken, transactionController.checkout);
router.post('/:id/upload-proof', verifyToken, upload.single('payment_proof'), transactionController.uploadPaymentProof);
router.get('/my-transactions', verifyToken, transactionController.getMyTransactions);
router.get('/tickets', verifyToken, transactionController.getMyTickets);

// Organizer & Admin routes
router.get('/all', verifyToken, isOrganizer, transactionController.getAllTransactions);
router.post('/:id/verify', verifyToken, isOrganizer, transactionController.verifyTransaction);

module.exports = router;
