const asyncHandler = require("express-async-handler")
const db = require("../models")
const CustomError = require("../utils/CustomError")
const Reservation = db.reservation
const Course = db.course

exports.saveReservation = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.body.courseId)

    if (!course) {
        throw new CustomError('Course nof Found.', 404)
    }

    const duplicatedReservation = await Reservation
        .findOne({
            course: req.body.courseId,
            user: req.userId
        })

    if (duplicatedReservation) {
        throw new CustomError('Reservation already saved for this course.', 409)
    }

    const reservation = new Reservation({
        comment: req.body.comment,
        course: course._id,
        user: req.userId,
    })
    await reservation.save()
    res.status(201).json({ message: 'Reservation was saved successfully!' })
})
