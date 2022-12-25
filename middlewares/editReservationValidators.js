const { check } = require('express-validator')
const mongoose = require('mongoose')

const db = require('../models')

const Course = db.course

const editReservationFromValidation = () => {
  return [
    check('targetCourseId')
    .customSanitizer((targetCourseId) => mongoose.Types.ObjectId(targetCourseId))
    .isMongoId()
    .withMessage('Course must be a valid MongoDB ID.')
    .custom(async (targetCourseId, { req }) => {
      const course = await Course.findById(targetCourseId)
      if (course) {
        req.course = course
      } else {
        throw new Error('Course not found with this ID.')
      }
    }),
    check('childrenIdList')
    .isArray({ min: 1 })
    .withMessage('Children ID list must be an array.'),
    check('childrenIdList.*')
    .isMongoId()
    .withMessage('Each element of Children ID list must be a valid mongodb ID'),
  ]
}

const editReservationFromValidator = {
  editReservationFromValidation,
}
module.exports = editReservationFromValidator
