const cloudinary = require('cloudinary').v2;
const config = require("../config")

// TODO: ez így szép / optimális?
cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
    secure: true,
});

module.exports = cloudinary
