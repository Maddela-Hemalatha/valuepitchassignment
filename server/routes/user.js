const express = require('express');
const user = require('../services/user');

const router = express.Router();

router.post('/register', user.register);
router.post('/login', user.login);

module.exports = router;