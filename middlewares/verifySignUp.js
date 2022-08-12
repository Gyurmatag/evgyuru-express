const db = require("../models")
const CustomError = require("../utils/CustomError")

const ROLES = db.ROLES

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
    checkRolesExisted
}
module.exports = verifySignUp
