const asyncHandler = require("express-async-handler")
const db = require("../models")
const CustomError = require("../utils/CustomError")
const User = db.user
const Reservation = db.reservation
const Course = db.course
const Child = db.child

exports.saveReservation = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.body.courseId)

    if (!course) {
        throw new CustomError('Course nof Found.', 404)
    }

    const applicant = req.user || await User.findOne({ email: req.body.userEmail })

    const duplicatedReservation = await Reservation
        .findOne({
            course: req.body.courseId,
            user: applicant._id
        })

    if (duplicatedReservation) {
        throw new CustomError('Reservation already saved for this course.', 409)
    }

    const childrenToSave = []
    for (let child of req.body.children) {
        let childToPush = new Child({
            name: child.name
        })
        childrenToSave.push(childToPush)
    }

    const savedChildren = await Child.insertMany(childrenToSave)

    const reservationToSave = new Reservation({
        course: course._id,
        user: applicant._id,
        children: savedChildren,
    })
    const reservation = await (await reservationToSave.save()).populate('course')

    applicant.reservations.push(reservation)
    await applicant.save()

    res.status(201).json(reservation)
})

exports.deleteReservation = asyncHandler(async (req, res) => {
    const toDeleteReservationId = req.params.reservationId
    const reservation = await Reservation.findById(req.params.reservationId)

    if (!reservation) {
        throw new CustomError('Reservation nof found.', 404)
    }

    const currentLoggedInUser = req.user

    if (reservation.user.toString() !== currentLoggedInUser._id.toString()) {
        throw new CustomError('Not authorized.', 403)
    }

    await Reservation.findByIdAndRemove(toDeleteReservationId);

    currentLoggedInUser.reservations.pull(toDeleteReservationId)
    currentLoggedInUser.reservations = currentLoggedInUser.reservations.filter(
        (reservation) => reservation._id !== toDeleteReservationId
    );
    await currentLoggedInUser.save()

    res.status(200).json({ message: 'Reservation was deleted successfully!' })
})

exports.getLoggedInUserReservationList =  asyncHandler(async (req, res) => {
    const currentPage = +req.query.page || 1
    const perPage = +req.query.limit || 5

    const reservationCount = await Reservation.find({ user: req.user._id }).countDocuments()
    const reservations = await Reservation
        .find({ user: req.user._id })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: 'descending' })
        .populate('course')

    res.status(200).json({
        message: 'Fetched user reservations successfully.',
        reservations,
        totalItems: reservationCount
    })
})

exports.findReservations =  asyncHandler(async (req, res) => {
    const currentPage = +req.query.page || 1
    const perPage = +req.query.limit || 5

    const reservationCount = await Reservation.find({ course: req.query.courseId }).countDocuments()
    const reservations = await Reservation
        .find({ course: req.query.courseId })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: 'descending' })
        .populate([{ path: 'course'}, {path: 'user', select: { password: 0 }}])

    res.status(200).json({
        message: 'Fetched reservations successfully.',
        reservations,
        totalItems: reservationCount
    })
})
