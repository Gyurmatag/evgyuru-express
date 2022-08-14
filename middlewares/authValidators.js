const { check } = require("express-validator");

const db = require("../models");

const User = db.user

const signupValidation = () => {
    return [
        check('email')
            .isEmail()
            .withMessage('E-mail must be a valid e-mail.')
            .custom(async email => {
                const userByEmail = await User.findOne({ email: email })
                if (userByEmail && !userByEmail.isNotRegisteredOnlyForCourseApply) {
                    throw new Error('Email address already taken.');
                }
            }),
        check('fullName')
            .isLength({ min: 3, max: 100 })
            .withMessage('Full name must be between 3 and 100 characters long.'),
        check('telephoneNumber')
            .isLength({ min: 10, max: 17 })
            .withMessage('Telephone number must be between 10 and 17 characters long.'),
        check('password')
            .optional({ nullable: true })
            .isLength({ min: 5 })
            .withMessage('Password must be minimum 5 characters long.'),
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
    ];
}

const loginValidation = () => {
    return [
        check('email')
            .isEmail()
            .withMessage('E-mail must be a valid e-mail.')
            .bail()
            .custom(async (email, { req }) => {
                const userByEmail = await User.findOne({ email, isNotRegisteredOnlyForCourseApply: false })
                    .populate([
                        'roles',
                        {
                            path: 'reservations',
                            populate: ['course']
                        }]
                    )
                if (!userByEmail) {
                    throw new Error('There is no account with this e-mail address.');
                } else {
                    req.user = userByEmail
                }
            }),
        check('password')
            .isLength({ min: 5 })
            .withMessage('Password must be minimum 5 characters long.'),
    ];
}

const editAccountValidation = () => {
    return [
        check('fullName')
            .optional()
            .isLength({ min: 3 })
            .withMessage('Full name must be minimum 3 characters long.'),
        check('telephoneNumber')
            .optional()
            .isLength({ min: 10, max: 17 })
            .withMessage('Telephone number must be between 10 and 17 characters long.'),
        check('zipCode')
            .optional()
            .isNumeric()
            .withMessage('Zip code must be only numbers.')
            .isLength({ min: 4, max: 4 })
            .withMessage('Zip code must be 4 numbers long.'),
        check('streetAddress')
            .optional()
            .isLength({ min: 5 })
            .withMessage('Street address must be minimum 5 characters long.'),
    ];
}

const authValidators = {
    signupValidation,
    loginValidation,
    editAccountValidation,
}
module.exports = authValidators
