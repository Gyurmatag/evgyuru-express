const express = require('express')
const reservationController = require('../controllers/reservation')
const { authJwt } = require("../middlewares")
const router = express.Router()

router.post('/save', [authJwt.verifyToken], reservationController.saveReservation)

module.exports = router
