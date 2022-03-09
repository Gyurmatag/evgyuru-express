const MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.PORT
const FRONTEND_CORS_ORIGIN = process.env.FRONTEND_CORS_ORIGIN
const AUTH_SECRET = process.env.AUTH_SECRET

module.exports = {
    MONGODB_URI,
    PORT,
    FRONTEND_CORS_ORIGIN,
    AUTH_SECRET,
}
