const mongoose = require('mongoose')
const asyncHandler = require("express-async-handler")
const moment = require('moment-timezone');
const db = require("../models")
const CustomError = require("../utils/CustomError")
const Course = db.course

exports.getCourseList =  asyncHandler(async (req, res) => {
    const currentPage = +req.query.page || 1
    const perPage = +req.query.limit || 5
    const projectId = req.query.projectId
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

    const courseCount = await Course.find( { project: projectId, dateFrom: dateFromFilters }).countDocuments()
    const courses = await Course
        .find( {
            project: projectId,
            dateFrom: dateFromFilters
        })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: 'descending' })
        .populate({ path: 'reservations', isActivated: { $eq: true } } )

    res.status(200).json({
        message: 'Fetched courses successfully.',
        courses,
        totalItems: courseCount
    })
})

exports.getSimpleAvailableCourseList =  asyncHandler(async (req, res) => {
    const projectId = req.query.projectId
    const excludedCourseId = req.query.excludedCourseId

    let dateFromFilters = {
        $gt: moment().toDate()
    }

    const courses = await Course
    .aggregate([
        {
            $lookup: {
                from: 'reservations',
                localField: 'reservations',
                foreignField: '_id',
                as: 'reservations'
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                dateFrom: 1,
                dateTo: 1,
                project: 1,
                imageUrl: 1,
                isCourseFull: { $gte: [ { $size: "$reservations" }, '$maxGroupSize'] }
            }
        },
        {
            $match: {
                $and: [
                    {
                        "_id": {
                            $ne: mongoose.Types.ObjectId(excludedCourseId)
                        }
                    },
                    { "project": mongoose.Types.ObjectId(projectId) },
                    { "dateFrom": dateFromFilters },
                    { "isCourseFull": false },
                ]
            }
        },
        {
            $facet: {
                simpleCourseListResult: [
                    {
                        $sort: {
                            dateFrom: -1
                        }
                    }
                ],
            }
        },
    ]);

    res.status(200).json({
        message: 'Fetched simple available courses successfully.',
        courses,
    })
})

exports.getCourse = asyncHandler(async (req, res) => {
    const courseId = req.params.courseId
    const course = await Course
        .findById(courseId)
        .populate('reservations')

    if (!course) {
        throw new CustomError('Could not find course.', 404)
    }
    res.status(200).json(course)
})

exports.addCourse =  asyncHandler(async (req, res) => {
    // TODO: időzóna kiszervezés
    const course = new Course({
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
        zipCode: req.body.zipCode,
        city: req.body.city,
        streetAddress: req.body.streetAddress,
        dateFrom: moment.tz(req.body.dateFrom, "Europe/Budapest"),
        dateTo: moment.tz(req.body.dateTo, "Europe/Budapest"),
        price: req.body.price,
        occasions: req.body.occasions,
        maxGroupSize: req.body.maxGroupSize,
        project: req.project,
    })
    await course.save()
    res.status(201).json({ message: 'Course was saved successfully!' })
})

exports.deleteCourse = asyncHandler(async (req, res) => {
    // TODO: tesztelni, hogy jó-e a hibaüzenet
    await Course.findByIdAndRemove(req.params.courseId)
    res.status(200).json({ message: 'Course was deleted successfully!' })
})

//TODO: itt lehet majd otpimalizálni, hogy csak azt updateljem amit kell??
exports.editCourse = asyncHandler(async (req, res) => {
    // TODO: időzóna kiszervezés
    const course = new Course({
        _id: req.body._id,
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
        zipCode: req.body.zipCode,
        city: req.body.city,
        streetAddress: req.body.streetAddress,
        dateFrom: moment.tz(req.body.dateFrom, "Europe/Budapest"),
        dateTo: moment.tz(req.body.dateTo, "Europe/Budapest"),
        price: req.body.price,
        occasions: req.body.occasions,
        maxGroupSize: req.body.maxGroupSize,
        reservations: req.body.reservations,
        project: req.project,
    })
    await Course.findByIdAndUpdate(req.params.courseId, course);

    res.status(200).json({ message: 'Course was updated successfully!' })
})
