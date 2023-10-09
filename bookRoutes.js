const express = require('express');
const router = express.Router();
const { Book, User } = require('./models/things'); // Ensure the path is correct
const auth = require('./middleware/auth');
const multer = require('./middleware/multer-config');
const path = require('path');
const app = express();
const fs = require('fs');

app.use('/images', express.static(path.join(__dirname, 'images')));


router.post('/api/books/:id/rating', auth, (req, res, next) => {
  const userId = req.body.userId;  // Assurez-vous que votre middleware d'authentification définit cela
  const grade = req.body.rating;

  // Valider la note
  if (grade < 1 || grade > 5) {
    return res.status(400).json({ message: 'Invalid rating' });
  }

  // Trouver le livre
  Book.findById(req.params.id)
    .then(book => {
      // Vérifier si l'utilisateur a déjà noté le livre
      if (book.ratings.some(rating => rating.userId.toString() === userId)) {
        return res.status(400).json({ message: 'User has already rated this book' });
      }

      // Ajouter la nouvelle note
      book.ratings.push({ userId, grade });

      // Mettre à jour la note moyenne
      book.averageRating = book.ratings.reduce((acc, rating) => acc + rating.grade, 0) / book.ratings.length;

      // Sauvegarder le livre mis à jour
      return book.save();
    })
    .then(() => res.status(201).json({ message: 'Rating added successfully!' }))
    .catch(error => res.status(400).json({ error }));
});


// POST /api/books
router.post('/api/books', auth, multer, (req, res, next) => {
  try {
    console.log(req.body);  // Log the raw body data for debugging
    
    // If using a form field named 'book' for stringified JSON book data
    const bookData = JSON.parse(req.body.book);  
    
    // Log the parsed book data for debugging
    console.log('Parsed book data:', bookData);  
    
    // Create a new Book instance with the parsed data and (if available) the image path
    const book = new Book({
      ...bookData,
      imageUrl: req.file ? 'http://localhost:3500/' + req.file.path.replace(/\\/g, '/') : null,  // Assuming Multer is used for image upload
    });
    
    // Save the book to the database and send a response
    book.save()
      .then(() => res.status(201).json({ message: 'Book successfully saved!' }))
      .catch(error => {
        console.error(error);  // Log the error for debugging
        res.status(400).json({ error });
      });
  } catch (error) {
    console.error(error);  // Log the error for debugging
    res.status(400).json({ error: 'Invalid book data format.' });
  }
});

// GET /api/books
router.get('/api/books', (req, res, next) => {
  Book.find()
    .then(books => {
      console.log(books);  // Log the books to the console
      res.status(200).json(books);
    })
    .catch(error => res.status(400).json({ error }));
});


// GET /api/books/:id
router.get('/api/books/:id', (req, res, next) => {
  Book.findById(req.params.id)
    .then(book => {
      console.log(book);  // Log the book to the console
      res.status(200).json(book);
    })
    .catch(error => res.status(404).json({ error }));
});


router.put('/api/books/:id', auth, multer, (req, res, next) => {
  let updatedBookData;

  // Check if a file is provided
  if (req.file) {
    updatedBookData = JSON.parse(req.body.book);
    updatedBookData.imageUrl = 'http://localhost:3500/' + req.file.path.replace(/\\/g, '/');
  } else {
    updatedBookData = req.body;
  }

  // Find the old book data
  Book.findById(req.params.id)
    .then((book) => {
      // If a new image is uploaded, delete the old image
      if (req.file && book.imageUrl) {
        const oldImagePath = book.imageUrl.replace('http://localhost:3500/', '');
        fs.unlink(oldImagePath, (err) => {
          if (err) console.log("Failed to delete old image:", err);
        });
      }

      // Update the book in the database
      return Book.updateOne({ _id: req.params.id }, { ...updatedBookData, _id: req.params.id });
    })
    .then(() => res.status(200).json({ message: 'Book updated successfully!' }))
    .catch(error => res.status(400).json({ error }));
});



// DELETE /api/books/:id
router.delete('/api/books/:id', auth, (req, res, next) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Book vanished into the void!' }))
    .catch(error => res.status(400).json({ error }));
});

// POST /api/books/:id/rating
router.post('/api/books/:id/rating', auth, (req, res, next) => {
});

module.exports = router;
