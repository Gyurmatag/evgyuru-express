const express = require('express');

const courseController = require('../controllers/course');

const router = express.Router();

router.get('/courses', courseController.getCourseList);

router.get('/:courseId', courseController.getCourse);

module.exports = router;
