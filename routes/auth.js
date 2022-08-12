const express = require('express')

const authController = require('../controllers/auth')
const { globalValidatorCheck, authJwt, authValidators} = require("../middlewares")

const router = express.Router()

router.post(
    '/signup',
    authValidators.signupValidation(),
    globalValidatorCheck.checkForErrors,
    authController.signup
)

router.post(
    '/signin',
    authValidators.loginValidation(),
    globalValidatorCheck.checkForErrors,
    authController.signin
)

router.put(
    '/assign-role',
    [authJwt.verifyToken, authJwt.isAdmin],
    authController.assignRoleToUser
)

router.get(
    '/is-email-already-registered',
    authController.isEmailAlreadyRegistered
)

router.put(
    '/password-reset/:passwordResetKey',
    authController.passwordReset
)

router.get(
    '/is-password-reset-key-valid/:passwordResetKey',
    authController.isPasswordResetKeyValid
)

router.put(
    '/password-reset',
    authController.claimPasswordResetKey
)

router.put(
    '/activation/:activationKey',
    authController.activateUser
)

router.put('/edit',
    authValidators.editAccountValidation(),
    [authJwt.verifyToken, globalValidatorCheck.checkForErrors],
    authController.editMyAccount
)

router.delete(
    '/delete',
    [authJwt.verifyToken],
    authController.deleteMyAccount
)

module.exports = router
