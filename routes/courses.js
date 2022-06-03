const express = require('express')

const courseController = require('../controllers/course')
const { authJwt } = require("../middlewares");

const router = express.Router()

router.get('/courses', courseController.getCourseList)

router.get('/:courseId', courseController.getCourse)

router.post('/save', [authJwt.verifyToken, authJwt.isModerator], courseController.addCourse)

router.delete('/:courseId', [authJwt.verifyToken, authJwt.isModerator], courseController.deleteCourse)

router.put('/:courseId', [authJwt.verifyToken, authJwt.isModerator], courseController.editCourse)

module.exports = router
