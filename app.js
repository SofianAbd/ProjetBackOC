const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bookRoutes = require('./bookRoutes');  // Import your book routes
const userRoutes = require('./userRoutes');
const cors = require('cors');
const path = require('path');





mongoose.connect('mongodb+srv://admin:admin@cluster0.r25dijh.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(cors());
app.use(express.json());  // Ensure to parse JSON body data


app.use((req, res, next) => {
  console.log('Requête reçue !');
  next();
});

app.use((req, res, next) => {
  res.status(201);
  next();
});

app.use(bookRoutes);
app.use(userRoutes);

app.use((req, res, next) => {
  console.log('Réponse envoyée avec succès !');
});

module.exports = app;
