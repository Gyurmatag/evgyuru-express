const { validationResult } = require("express-validator");

const CustomError = require("../utils/CustomError");

const checkForErrors = ((req, res, next) => {
    const errors = validationResult(req);

    // TODO: http status code-ok customizálása
    if (!errors.isEmpty()) {
        throw new CustomError(errors, 400)
    }

    next()
})

const globalValidatorCheck = {
    checkForErrors
}
module.exports = globalValidatorCheck
