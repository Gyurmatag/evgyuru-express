const express = require('express');

const projectController = require('../controllers/project');

const router = express.Router();

router.get('/projects', projectController.getProjectList);

router.get('/:projectId', projectController.getProject);

module.exports = router;
