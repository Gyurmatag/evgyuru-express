class CustomError extends Error {
    constructor (message, statusCode) {
        super(message)
        Error.captureStackTrace(this, this.constructor)

        this.name = this.constructor.name
        this.message = message || 'Something went wrong. Please try again.';
        this.statusCode = statusCode || 400
    }
}

module.exports = CustomError
