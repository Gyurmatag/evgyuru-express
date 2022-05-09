const express = require('express')
const reservationController = require('../controllers/reservation')
const { authJwt } = require("../middlewares")
const router = express.Router()

router.post('/save', reservationController.saveReservation)
router.get('/user-reservations', [authJwt.verifyToken], reservationController.getLoggedInUserReservationList)
router.get('/reservations', [authJwt.verifyToken, authJwt.isModerator], reservationController.findReservations)
router.delete('/:reservationId', [authJwt.verifyToken], reservationController.deleteReservation)

module.exports = router
