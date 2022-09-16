const asyncHandler = require("express-async-handler")
const db = require("../models")
const CustomError = require("../utils/CustomError")
const Project = db.project

exports.getProjectList =  asyncHandler(async (req, res) => {
    const currentPage = +req.query.page || 1
    const perPage = +req.query.limit || 5

    const projectCount = await Project.find().countDocuments()
    const projects = await Project
        .find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: 'descending' })

    res.status(200).json({
        message: 'Fetched projects successfully.',
        projects,
        totalItems: projectCount
    })
})

exports.getProject = asyncHandler(async (req, res) => {
    const projectId = req.params.projectId
    const project = await Project.findById(projectId)
    if (!project) {
        throw new CustomError('Could not find project.', 404)
    }
    res.status(200).json(project)
})
