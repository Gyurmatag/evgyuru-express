const asyncHandler = require("express-async-handler")
const cloudinary = require("../utils/cloudinary");

// TODO: error kezelés tesztelése
exports.uploadImage = asyncHandler(async (req, res) => {
    const result = await cloudinary.uploader.upload(req.body.image);
    res.status(201).json({ message: 'Image uploaded successfully.', result })
})
