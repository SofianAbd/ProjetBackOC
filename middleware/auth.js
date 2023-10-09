// middleware/auth.js

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        console.log('Token:', token);
        
        const decodedToken = jwt.verify(token, 'RANDOM_SECRET_TOKEN');
        console.log('Decoded Token:', decodedToken);
        
        const userId = decodedToken.userId;
        console.log('User ID:', userId);
        
        if (req.body.userId && req.body.userId !== userId) {
          throw 'Invalid user ID';
        } else {
          next();
        }
      } catch (error) {
        console.log('Error:', error);
        res.status(401).json({
          error: 'Invalid request!'
        });
      }
};
