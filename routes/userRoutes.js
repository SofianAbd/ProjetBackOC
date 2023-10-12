const express = require('express');
const userController = require('../controllers/userController'); // Ensure the path is correct

const router = express.Router();

router.post('/api/auth/signup', userController.signup);
router.post('/api/auth/login', userController.login);

module.exports = router;
