const asyncHandler = require("express-async-handler")
const db = require("../models")
const CustomError = require("../utils/CustomError")
const Course = db.course

exports.getCourseList =  asyncHandler(async (req, res) => {
    const currentPage = +req.query.page || 1
    const perPage = +req.query.limit || 5
    const projectId = req.query.projectId

    const courseCount = await Course.find( { project: projectId }).countDocuments()
    const courses = await Course
        .find( { project: projectId })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: 'descending' })

    res.status(200).json({
        message: 'Fetched courses successfully.',
        courses,
        totalItems: courseCount
    })
})

exports.getCourse = asyncHandler(async (req, res) => {
    const courseId = req.params.courseId
    const course = await Course.findById(courseId)
    if (!course) {
        throw new CustomError('Could not find course.', 404)
    }
    res.status(200).json({ message: 'Course fetched successfully.', course })
})
