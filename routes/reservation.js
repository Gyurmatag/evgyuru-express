const express = require('express')

const reservationController = require('../controllers/reservation')
const { authJwt, reservationValidators, globalValidatorCheck } = require("../middlewares")

const router = express.Router()

router.post(
    '/save',
    reservationValidators.reservationFromValidation(),
    globalValidatorCheck.checkForErrors,
    reservationController.saveReservation
)

router.post(
    '/logged-in-save',
    reservationValidators.reservationFromValidation(),
    globalValidatorCheck.checkForErrors,
    [authJwt.verifyToken],
    reservationController.saveReservation)

router.put(
    '/activation/:activationKey',
    reservationController.activateReservation
)

router.get(
    '/user-reservations',
    [authJwt.verifyToken],
    reservationController.getLoggedInUserReservationList
)

router.get(
    '/reservations',
    [authJwt.verifyToken, authJwt.isModerator],
    reservationController.findReservations
)

router.delete(
    '/:reservationId',
    [authJwt.verifyToken],
    reservationController.deleteReservation
)

module.exports = router
