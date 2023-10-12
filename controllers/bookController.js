const { Book } = require('../models/things');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  try {
    const bookData = JSON.parse(req.body.book);  
    const book = new Book({
      ...bookData,
      imageUrl: req.file ? 'http://localhost:3500/' + req.file.path.replace(/\\/g, '/') : null,
    });
    book.save()
      .then(() => res.status(201).json({ message: 'Book successfully saved!' }))
      .catch(error => res.status(400).json({ error }));
  } catch (error) {
    res.status(400).json({ error: 'Invalid book data format.' });
  }
};

exports.getAllBooks = (req, res, next) => {
  // Logic for retrieving all books
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

exports.getBookById = (req, res, next) => {
  // Logic for retrieving a single book by ID
  Book.findById(req.params.id)
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

exports.updateBook = (req, res, next) => {
  // Logic for updating a book
  let updatedBookData;
  if (req.file) {
    updatedBookData = JSON.parse(req.body.book);
    updatedBookData.imageUrl = 'http://localhost:3500/' + req.file.path.replace(/\\/g, '/');
  } else {
    updatedBookData = req.body;
  }
  Book.findById(req.params.id)
    .then((book) => {
      if (req.file && book.imageUrl) {
        const oldImagePath = book.imageUrl.replace('http://localhost:3500/', '');
        fs.unlink(oldImagePath, (err) => {
          if (err) console.log("Failed to delete old image:", err);
        });
      }
      return Book.updateOne({ _id: req.params.id }, { ...updatedBookData, _id: req.params.id });
    })
    .then(() => res.status(200).json({ message: 'Book updated successfully!' }))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  // Logic for deleting a book
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Book vanished into the void!' }))
    .catch(error => res.status(400).json({ error }));
};

exports.rateBook = (req, res, next) => {
  // Logic for rating a book
  const userId = req.body.userId; 
  const grade = req.body.rating;
  if (grade < 1 || grade > 5) {
    return res.status(400).json({ message: 'Invalid rating' });
  }
  Book.findById(req.params.id)
    .then(book => {
      if (book.ratings.some(rating => rating.userId.toString() === userId)) {
        return res.status(400).json({ message: 'User has already rated this book' });
      }
      book.ratings.push({ userId, grade });
      book.averageRating = book.ratings.reduce((acc, rating) => acc + rating.grade, 0) / book.ratings.length;
      return book.save();
    })
    .then(() => res.status(201).json({ message: 'Rating added successfully!' }))
    .catch(error => res.status(400).json({ error }));
};
