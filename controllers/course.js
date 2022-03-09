const Course = require('../models/course');

exports.getCourseList = (req, res, next) => {
    const currentPage = +req.query.page || 1;
    const perPage = +req.query.limit || 5;
    const projectId = req.query.projectId
    let totalItems;
    Course.find()
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Course.find({project: projectId})
                .skip((currentPage - 1) * perPage)
                .limit(perPage)
                .sort({createdAt: 'descending'});
        })
        .then(courses => {
            res.status(200).json({
                message: 'Fetched courses successfully.',
                courses: courses,
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

exports.getCourse = (req, res, next) => {
    const courseId = req.params.courseId;
    Course.findById(courseId)
        .then(course => {
            if (!course) {
                const error = new Error('Could not find course.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'Course fetched.', course: course });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
