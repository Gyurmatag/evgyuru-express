class CustomError extends Error {
    constructor (message, statusCode) {
        super(message)
        Error.captureStackTrace(this, this.constructor)

        this.name = this.constructor.name
        this.statusCode = statusCode
    }
}

module.exports = CustomError
