
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const bookController = require('../controllers/bookController');

router.post('/api/books', auth, multer, bookController.createBook);
router.get('/api/books', bookController.getAllBooks);
router.get('/api/books/:id', bookController.getBookById);
router.put('/api/books/:id', auth, multer, bookController.updateBook);
router.delete('/api/books/:id', auth, bookController.deleteBook);
router.post('/api/books/:id/rating', auth, bookController.rateBook);

module.exports = router;
