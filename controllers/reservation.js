const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken");
const ical = require('ical-generator');
const moment = require("moment-timezone");

const db = require("../models")
const CustomError = require("../utils/CustomError")
const config = require("../config");
const { sendEmail } = require("../utils/nodemailer");
const { createCalendarEvent } = require('../utils/createCalendarEvent')
const mongoose = require('mongoose')

const User = db.user
const Reservation = db.reservation
const Course = db.course
const Child = db.child

const sendReservationAlertToModerator = async (applicant, reservation, isApplied) => {
    // TODO: nyelvesítések, esetleges kiszevezések, dátum, stb...
    await sendEmail(
      config.EMAIL_USER,
      'Évgyűrű Alaptívány foglalás értesítés',
      'reservation-apply-delete-alert',
      {
          parentName: applicant.fullName,
          courseTitle: reservation.course.title,
          children: reservation.children,
          isApplied
      }
    )
}

exports.saveReservation = asyncHandler(async (req, res) => {
    const course = req.course;

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
        const { headers, icalEvent } = createCalendarEvent(reservation.course, reservation._id)
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
        // TODO: nyelvesítések, esetleges kiszevezések, dátum, stb...
        await sendReservationAlertToModerator(applicant, reservation, true)

    }

    applicant.reservations.push(reservation)
    await applicant.save()

    course.reservations.push(reservation)
    await course.save()

    res.status(201).json(reservation)
})

exports.editReservation = asyncHandler(async (req, res) => {
    const oldReservation = await Reservation.findById(req.params.reservationId).populate(['course', 'children'])

    if (!oldReservation) {
        throw new CustomError('Old reservation not found.', 404)
    }

    const currentLoggedInUser = req.user

    if (oldReservation.user.toString() !== currentLoggedInUser._id.toString()) {
        throw new CustomError('Not authorized.', 403)
    }

    const course = req.course;

    const childrenInsideReservation = oldReservation.children.filter(child => req.body.childrenIdList.some(childrenId => mongoose.Types.ObjectId(childrenId).equals(child._id)))

    if (!childrenInsideReservation.length) {
        throw new CustomError('Children not found inside reservation.', 404)
    }

    const reservationToSave = new Reservation({
        course: course._id,
        user: currentLoggedInUser._id,
        children: childrenInsideReservation,
        activationKey: '',
        isActivated: true,
    })
    const reservation = await (await reservationToSave.save()).populate(['course', 'children'])

    const noNeedToKeepOldReservation = oldReservation.children.length === childrenInsideReservation.length

    if (noNeedToKeepOldReservation) {
        await Reservation.findByIdAndRemove(oldReservation._id);
    } else {
        const childrenInsideReservationIds = childrenInsideReservation.map((children) => children._id);
        oldReservation.children = oldReservation.children.filter((children) => !childrenInsideReservationIds.includes(children._id));
        await oldReservation.save()
    }

    const { headers, icalEvent } = createCalendarEvent(reservation.course, reservation._id)

    // TODO: nyelvesítések, esetleges kiszevezések, dátum, stb...
    // TODO: régi kurzusról infók legyenek itt
    await sendEmail(
      currentLoggedInUser.email,
      'Évgyűrű Alaptívány sikeres kurzus foglalás módosítás',
      'reservation-success',
      {
          fullName: currentLoggedInUser.fullName,
          courseTitle: reservation.course.title,
          dateFrom: moment(reservation.course.dateFrom).format('YYYY-MM-DD'),
          dateTo: moment(reservation.course.dateTo).format('YYYY-MM-DD'),
          children: reservation.children,
      },
      headers,
      icalEvent
    )
    await sendReservationAlertToModerator(currentLoggedInUser, reservation, true)
    res.status(201).json({ message: 'success.api.reservationUpdatedSuccessfully' })

})


exports.activateReservation =  asyncHandler(async (req, res) => {
    const reservation =
      await Reservation.findOne({ activationKey: req.params.activationKey }).populate(['user', 'course', 'children'])
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
    await sendReservationAlertToModerator(user, reservation, true)
    res.status(200).json({ message: 'Reservation was activated successfully!' })
})

exports.deleteReservation = asyncHandler(async (req, res) => {
    const toDeleteReservationId = req.params.reservationId
    const reservation = await Reservation.findById(req.params.reservationId).populate(['course', 'children'])

    if (!reservation) {
        throw new CustomError('Reservation not found.', 404)
    }

    const currentLoggedInUser = req.user

    if (reservation.user.toString() !== currentLoggedInUser._id.toString()) {
        throw new CustomError('Not authorized.', 403)
    }

    await sendReservationAlertToModerator(currentLoggedInUser, reservation, false)
    await Reservation.findByIdAndRemove(toDeleteReservationId);

    currentLoggedInUser.reservations.pull(toDeleteReservationId)
    currentLoggedInUser.reservations = currentLoggedInUser.reservations.filter(
        (reservation) => reservation._id !== toDeleteReservationId
    );
    await currentLoggedInUser.save()

    res.status(200).json({ message: 'Reservation was deleted successfully!' })
})

exports.getLoggedInUserReservationById =  asyncHandler(async (req, res) => {
    const reservation = await Reservation.findOne({ _id: req.reservationId, user: req.user._id }).populate(['course', 'children'])
    res.status(200).json(reservation)
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
                            $sort: {
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
