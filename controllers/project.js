const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Project = require('../models/project');
const User = require('../models/user');

exports.getProjectList = (req, res, next) => {
    const currentPage = +req.query.page || 1;
    const perPage = +req.query.limit || 5;
    let totalItems;
    Project.find()
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Project.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage)
                .sort({createdAt: 'descending'});
        })
        .then(projects => {
            console.log(projects)
            res.status(200).json({
                message: 'Fetched projects successfully.',
                projects: projects,
                totalItems: totalItems
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getProject = (req, res, next) => {
    const projectId = req.params.projectId;
    Project.findById(projectId)
        .then(project => {
            if (!project) {
                const error = new Error('Could not find project.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'Project fetched.', project: project });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
