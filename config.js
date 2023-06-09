const MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.PORT
const FRONTEND_CORS_ORIGIN = process.env.FRONTEND_CORS_ORIGIN
const AUTH_SECRET = process.env.AUTH_SECRET
const ACCESS_TOKEN_EXPIRE_TIME_IN_MS = process.env.ACCESS_TOKEN_EXPIRE_TIME_IN_MS
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET
const EMAIL_HOST = process.env.EMAIL_HOST
const EMAIL_PORT = process.env.EMAIL_PORT
const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD

module.exports = {
    MONGODB_URI,
    PORT,
    FRONTEND_CORS_ORIGIN,
    AUTH_SECRET,
    ACCESS_TOKEN_EXPIRE_TIME_IN_MS,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_PASSWORD,
}
