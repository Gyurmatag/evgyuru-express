const express = require('express');

const projectController = require('../controllers/project');

const router = express.Router();

router.get('/projects', projectController.getProjectList);

router.get('/project/:projectId', projectController.getProject);

module.exports = router;
