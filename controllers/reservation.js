const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken");
const ical = require('ical-generator');
const moment = require("moment-timezone");

const db = require("../models")
const CustomError = require("../utils/CustomError")
const config = require("../config");
const { sendEmail } = require("../utils/nodemailer");

const User = db.user
const Reservation = db.reservation
const Course = db.course
const Child = db.child

exports.saveReservation = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.body.courseId)

    if (!course) {
        throw new CustomError('Course nof Found.', 404)
    }

    if (moment(course.dateFrom).isBefore(moment().toDate())) {
        throw new CustomError('Course starting date is before current date.')
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
        activationKey: req.user ? '' : jwt.sign({ email: applicant.email }, config.AUTH_SECRET),
        isActivated: !!req.user,
    })
    const reservation = await (await reservationToSave.save()).populate(['course', 'children'])

    if (!reservation.isActivated) {
        // TODO: e-mail szöveg kiszervezése
        // TODO: nyelvesítések, esetleges kiszevezések!
        await sendEmail(
            applicant.email,
            'Évgyűrű Alaptívány sikeres kurzus jelentkezés megerősítése',
            'reservation-confirm',
            {
                fullName: applicant.fullName,
                courseTitle: reservation.course.title,
                dateFrom: moment(reservation.course.dateFrom).format('YYYY-MM-DD'),
                dateTo: moment(reservation.course.dateTo).format('YYYY-MM-DD'),
                children: reservation.children,
                confirmLink: `https://www.evgyuru.hu/kurzusok/megerosites/${reservation.activationKey}`
            },
        )
    } else {
        // TODO: kiszervezni ezt a calendaros cuccot, szépíteni
        const calendar = ical({ name: reservation.course.title });
        calendar.createEvent({
            organizer: {
                name: 'Évgyűrű Alapítvány',
                email: 'info@evgyuru.hu'
            },
            start: reservation.course.dateFrom,
            end: reservation.course.dateTo,
            summary: reservation.course.title,
            description: reservation.course.title,
            location: `${reservation.course.city}, ${reservation.course.streetAddress}, ${reservation.course.zipCode}`,
            url: 'https://www.evgyuru.hu/'
        });
        const headers = {
            'x-invite': {
                prepared: true,
                value: reservation._id
            }
        }
        const icalEvent = {
            filename: 'invite.ics',
            method: 'PUBLISH',
            content: calendar.toString()
        }
        // TODO: nyelvesítések, esetleges kiszevezések, dátum, stb...
        await sendEmail(
            applicant.email,
            'Évgyűrű Alaptívány sikeres kurzus foglalás',
            'reservation-success',
            {
                fullName: applicant.fullName,
                courseTitle: reservation.course.title,
                dateFrom: moment(reservation.course.dateFrom).format('YYYY-MM-DD'),
                dateTo: moment(reservation.course.dateTo).format('YYYY-MM-DD'),
                children: reservation.children,
            },
            headers,
            icalEvent
        )
    }

    applicant.reservations.push(reservation)
    await applicant.save()

    course.reservations.push(reservation)
    await course.save()

    res.status(201).json(reservation)
})

exports.activateReservation =  asyncHandler(async (req, res) => {
    const reservation = await Reservation.findOne({ activationKey: req.params.activationKey }).populate('user')
    const user = reservation.user
    if (!user.isActivated && !user.isNotRegisteredOnlyForCourseApply) {
        const user = reservation.user
        user.isActivated = true
        await user.save()
    }
    if (!reservation) {
        throw new CustomError('Reservation not found with this activation key!', 404)
    }
    reservation.isActivated = true
    await reservation.save()
    res.status(200).json({ message: 'Reservation was activated successfully!' })
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
    let dateFromFilters

    // TODO: kiszervezni? szépíteni?
    const filterDateFromAfterToday = (req.query.filterDateFromAfterToday).toString().trim().toLowerCase();
    const filterDateFromAfterTodayResult = !((filterDateFromAfterToday === 'false') || (filterDateFromAfterToday === '0') || (filterDateFromAfterToday === ''));

    // TODO: lehetséges refakt?
    if (filterDateFromAfterTodayResult) {
        dateFromFilters = {
            $gt: moment().toDate()
        }
    } else if (filterDateFromAfterTodayResult === false) {
        dateFromFilters = {
            $lt: moment().toDate()
        }
    }

    const reservations = await Reservation
        .aggregate([
            {
                $lookup: {
                    from: Course.collection.name,
                    localField: "course",
                    foreignField: "_id",
                    as: "course"
                }
            },
            {
                $lookup: {
                    from: 'children',
                    localField: 'children',
                    foreignField: '_id',
                    as: 'children'
                }
            },
            {
                $match: {
                    $and: [
                        {"user": req.user._id},
                        {"course.dateFrom": dateFromFilters},
                    ]
                }
            },
            {
                $project: {
                    isActivated: 1,
                    course: { $first: "$course" },
                    children: 1
                }
            },
            {
                $facet: {
                    paginatedResults: [
                        {
                            $sort : {
                                createdAt: -1
                            }
                        },
                        {
                            $skip: (currentPage - 1) * perPage
                        },
                        {
                            $limit: perPage
                        }
                    ],
                    totalCount: [
                        {
                            $count: 'count'
                        }
                    ],
                }
            },
        ]);


    res.status(200).json({
        message: 'Fetched user reservations successfully.',
        reservations,
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
        .populate([{ path: 'course'}, { path: 'children' }, { path: 'user', select: { password: 0, activationKey: 0, isActivated: 0, passwordResetKey: 0  } }])

    res.status(200).json({
        message: 'Fetched reservations successfully.',
        reservations,
        totalItems: reservationCount
    })
})
