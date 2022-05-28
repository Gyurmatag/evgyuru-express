const express = require('express')
const externalController = require('../controllers/external')
const { authJwt } = require("../middlewares");

const router = express.Router()

router.post('/image-upload', [authJwt.verifyToken, authJwt.isModerator], externalController.uploadImage)

module.exports = router
