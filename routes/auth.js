const express = require('express')
const authController = require('../controllers/auth')
const { verifySignUp, authJwt} = require("../middlewares")
const router = express.Router()

router.post('/signup', [verifySignUp.checkDuplicateEmail, verifySignUp.checkRolesExisted], authController.signup)

router.post('/signin', authController.signin)

router.put('/assign-role', [authJwt.isAdmin], authController.assignRoleToUser)

router.get('/is-email-already-registered', authController.isEmailAlreadyRegistered)

router.put('/password-reset/:passwordResetKey', authController.passwordReset)

router.get('/is-password-reset-key-valid/:passwordResetKey', authController.isPasswordResetKeyValid)

router.put('/password-reset', authController.claimPasswordResetKey)

router.put('/activation/:activationKey', authController.activateUser)

router.delete('/delete', [authJwt.verifyToken], authController.deleteMyAccount)

module.exports = router
