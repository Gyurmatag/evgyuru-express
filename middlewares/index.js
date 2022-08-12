const globalValidatorCheck = require("./globalValidatorCheck")
const authJwt = require("./authJwt")
const verifySignUp = require("./verifySignUp")
const authValidators = require("./authValidators")
const courseValidators = require("./courseValidators")
const reservationValidators = require("./reservationValidators")

module.exports = {
    globalValidatorCheck,
    authJwt,
    verifySignUp,
    authValidators,
    courseValidators,
    reservationValidators
}
