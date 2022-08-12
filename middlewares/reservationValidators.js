const { check } = require("express-validator");
const mongoose = require('mongoose');

const db = require("../models");

const Course = db.course

const reservationFromValidation = () => {
    return [
        check('courseId')
            .customSanitizer((courseId) => mongoose.Types.ObjectId(courseId))
            .isMongoId()
            .withMessage('Course must be a valid MongoDB ID.')
            .custom(async (courseId, { req }) => {
                const course = await Course.findById(courseId)
                if (course) {
                    req.course = course
                } else {
                    throw new Error('Course not found with this ID.');
                }
            }),
        check('userEmail')
            .optional()
            .isEmail()
            .withMessage('User email address must be a valid e-mail.'),
        check("children.*.name")
            .isLength({ min: 3, max: 100 })
            .withMessage('Child name must be between 3 and 100 characters.')

    ];
}

const reservationValidators = {
    reservationFromValidation,
}
module.exports = reservationValidators
