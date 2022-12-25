const express = require('express')

const reservationController = require('../controllers/reservation')
const { authJwt, reservationValidators, globalValidatorCheck } = require(
  '../middlewares')
const editReservationFromValidators = require(
  '../middlewares/editReservationValidators')

const router = express.Router()

router.post(
  '/save',
  reservationValidators.reservationFromValidation(),
  globalValidatorCheck.checkForErrors,
  reservationController.saveReservation,
)

router.put(
  '/edit/:reservationId',
  editReservationFromValidators.editReservationFromValidation(),
  globalValidatorCheck.checkForErrors,
  [authJwt.verifyToken],
  reservationController.editReservation,
)

router.post(
  '/logged-in-save',
  reservationValidators.reservationFromValidation(),
  globalValidatorCheck.checkForErrors,
  [authJwt.verifyToken],
  reservationController.saveReservation)

router.put(
  '/activation/:activationKey',
  reservationController.activateReservation,
)

router.get(
  '/user-reservations/:reservationId',
  [authJwt.verifyToken],
  reservationController.getLoggedInUserReservationById,
)

router.get(
  '/user-reservations',
  [authJwt.verifyToken],
  reservationController.getLoggedInUserReservationList,
)

router.get(
  '/reservations',
  [authJwt.verifyToken, authJwt.isModerator],
  reservationController.findReservations,
)

router.delete(
  '/:reservationId',
  [authJwt.verifyToken],
  reservationController.deleteReservation,
)

module.exports = router
