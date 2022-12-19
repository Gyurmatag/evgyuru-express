const express = require('express')

const courseController = require('../controllers/course')
const { authJwt, globalValidatorCheck, courseValidators } = require("../middlewares");

const router = express.Router()

router.get(
    '/courses',
    courseController.getCourseList
)

router.get(
  '/simple-available-courses',
  courseController.getSimpleAvailableCourseList
)

router.get(
    '/:courseId',
    courseController.getCourse
)

router.post(
    '/save',
    courseValidators.courseFormValidation(),
    [globalValidatorCheck.checkForErrors, authJwt.verifyToken, authJwt.isModerator],
    courseController.addCourse
)

router.delete(
    '/:courseId',
    [authJwt.verifyToken, authJwt.isModerator],
    courseController.deleteCourse
)

router.put(
    '/:courseId',
    courseValidators.courseFormValidation(),
    [globalValidatorCheck.checkForErrors, authJwt.verifyToken, authJwt.isModerator],
    courseController.editCourse
)

module.exports = router
