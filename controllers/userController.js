const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/things'); // Ensure the path is correct

exports.signup = (req, res, next) => {
    User.findOne({ email: req.body.email })
      .then(user => {
        if (user) {
          return res.status(400).json({ message: 'Email already in use!' });
        }
        

        bcrypt.hash(req.body.password, 10)
          .then(hash => {
            const newUser = new User({
              email: req.body.email,
              password: hash
            });
            newUser.save()
              .then(() => res.status(201).json({ message: 'User created successfully!' }))
              .catch(error => res.status(400).json({ error }));
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'User not found!' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Incorrect password!' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_SECRET_TOKEN',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
