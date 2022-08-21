const { check } = require("express-validator");
const moment = require("moment-timezone");

const db = require("../models");

const Project = db.project

const courseFormValidation = () => {
    return [
        check('title')
            .isLength({ min: 2, max: 100 })
            .withMessage('Title must be minimum 2 and 100 characters long.'),
        check('imageUrl')
            .isURL()
            .withMessage('Image URL must be an actual URL.'),
        check('description')
            .isLength({ min: 10 })
            .withMessage('Description must be at least 10 characters long.'),
        check('zipCode')
            .isNumeric()
            .withMessage('Zip code must be only numbers.')
            .isLength({ min: 4, max: 4 })
            .withMessage('Zip code must be 4 numbers long.'),
        check('city')
            .isLength({ min: 2, max: 100 })
            .withMessage('City must be between 2 and 100 characters long.'),
        check('streetAddress')
            .isLength({ min: 5, max: 200 })
            .withMessage('Street address must be between 5 and 200 characters long.'),
        check('dateFrom')
            .customSanitizer((dateTo) => moment(dateTo).format('YYYY-MM-DD HH:mm:ss'))
            .isISO8601()
            .withMessage('DateFrom must be a valid date.'),
        check('dateTo')
            .customSanitizer((dateTo) => moment(dateTo).format('YYYY-MM-DD HH:mm:ss'))
            .isISO8601()
            .withMessage('DateTo must be a valid date.'),
        check('maxGroupSize')
            .isNumeric()
            .withMessage('Max Group size must be a numeric value.')
            .isInt({ min: 1, max: 500 })
            .withMessage('Max Group size must be between 1 and 500.'),
        check('price')
            .isNumeric()
            .withMessage('Price must be a numeric value.')
            .isInt({ min: 1, max: 10000000 })
            .withMessage('Max Group size must be between 1 and 10000000.'),
        check('occasions')
            .isNumeric()
            .withMessage('Occasions must be a numeric value.')
            .isInt({ min: 1, max: 200 })
            .withMessage('Occasions must be between 1 and 200.'),
        check('project')
            .isMongoId()
            .withMessage('Project must be a valid MongoDB ID.')
            .custom(async (projectId, { req }) => {
                const project = await Project.findById(projectId)
                if (project) {
                    req.project = project
                } else {
                    throw new Error('Project not found with this ID.');
                }
            }),
    ];
}

const courseValidators = {
    courseFormValidation,
}
module.exports = courseValidators
