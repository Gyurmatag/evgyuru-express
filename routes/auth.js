const express = require('express')
const authController = require('../controllers/auth')
const { verifySignUp } = require("../middlewares")
const router = express.Router()

router.post('/signup', [verifySignUp.checkDuplicateEmail, verifySignUp.checkRolesExisted], authController.signup)

router.post('/signin', authController.signin)

router.get('/is-email-already-registered', authController.isEmailAlreadyRegistered)

module.exports = router
