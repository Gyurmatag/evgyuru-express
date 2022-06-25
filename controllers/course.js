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
        .populate('reservations')

    res.status(200).json({
        message: 'Fetched courses successfully.',
        courses,
        totalItems: courseCount
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
    const project = await findProject(req.body.project)
    const course = new Course({
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
        dateFrom: `${req.body.dateFrom}Z`,
        dateTo: `${req.body.dateTo}Z`,
        price: req.body.price,
        occasions: req.body.occasions,
        maxGroupSize: req.body.maxGroupSize,
        project,
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
    const project = await findProject(req.body.project)
    const course = new Course({
        _id: req.body._id,
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
        dateFrom: `${req.body.dateFrom}Z`,
        dateTo: `${req.body.dateTo}Z`,
        price: req.body.price,
        occasions: req.body.occasions,
        maxGroupSize: req.body.maxGroupSize,
        reservations: req.body.reservations,
        project,
    })
    await Course.findByIdAndUpdate(req.params.courseId, course);

    res.status(200).json({ message: 'Course was updated successfully!' })
})

const findProject = async (projectId) => {
    const project = await Project.findById(projectId)
    if (!project) {
        throw new CustomError('Could not find project.', 404)
    }
    return project
}
