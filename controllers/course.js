const asyncHandler = require("express-async-handler")
const db = require("../models")
const CustomError = require("../utils/CustomError")
const Course = db.course
const Project = db.project

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

exports.addCourse =  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.body.project)
    if (!project) {
        throw new CustomError('Could not find project.', 404)
    }
    const course = new Course({
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
        dateFrom: req.body.dateFrom,
        dateTo: req.body.dateTo,
        price: req.body.price,
        occasions: req.body.occasions,
        project,
    })
    await course.save()
    res.status(201).json({ message: 'Course was saved successfully!' })
})
