const express = require('express');
const authController = require('../controllers/auth');
const { verifySignUp } = require("../middlewares");
const router = express.Router();

router.post('/signup', [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted], authController.signup);

router.post('/signin', authController.signin);

module.exports = router;
