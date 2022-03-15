const asyncHandler = require('express-async-handler')
const db = require("../models")
const CustomError = require("../utils/CustomError")
const ROLES = db.ROLES
const User = db.user

checkDuplicateUsernameOrEmail =  asyncHandler(async (req, res, next) => {
    const userByUsername = await User.findOne({ username: req.body.username })
    if (userByUsername) {
        throw new CustomError('Username already taken.', 400)
    }

    const userByEmail = await User.findOne({ email: req.body.email })
    if (userByEmail) {
        throw new CustomError('Email already taken.', 400)
    }

    next()
})

checkRolesExisted = (req, res, next) => {
    if (req.body.roles) {
        for (const role of req.body.roles) {
            if (!ROLES.includes(role)) {
                throw new CustomError(`Failed! Role ${req.body.roles[i]} does not exist!`, 400)
            }
        }
    }

    next()
}
const verifySignUp = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted
}
module.exports = verifySignUp