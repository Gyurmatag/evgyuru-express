const jwt = require("jsonwebtoken")
const asyncHandler = require("express-async-handler")
const config = require("../config")
const db = require("../models")
const CustomError = require("../utils/CustomError")
const User = db.user
const Role = db.role

verifyToken = asyncHandler(async (req, res, next) => {
    const token = req.headers["x-access-token"]
    if (!token) {
        throw new CustomError('No token provided!', 403)
    }
    // Itt azért kell try-catch, hogy tudjuk specifikus Status Code-ot küldeni vissza (401).
    try {
        const decodedToken = await jwt.verify(token, config.AUTH_SECRET)
        req.user = await User.findById(decodedToken._id)
    } catch (err) {
        throw new CustomError(err.message, 401)
    }
    next()
})

isAdmin = (req, res, next) => hasSpecificRole(req, res, next, "admin")
isModerator = (req, res, next) => hasSpecificRole(req, res, next, "moderator")

// TODO: tesztelni még kell
const hasSpecificRole = asyncHandler( async(req, res, next, roleName) => {
    const user = await User.findById(req.userId)
    const roles = await Role.find({ _id: { $in: user.roles } })

    for (const role of roles) {
        if (role.name === roleName) {
            next()
        }
    }

    throw new CustomError(`Require ${roleName} Role!`, 403)
})

const authJwt = {
    verifyToken,
    isAdmin,
    isModerator
}
module.exports = authJwt
