const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { projectValidation } = require('../middleware/validation');

// GET /api/projects - Get all projects
router.get('/', projectController.getAllProjects);

// GET /api/projects/:id - Get project by ID
router.get('/:id', projectController.getProjectById);

// POST /api/projects - Create new project
router.post('/', projectValidation.create, projectController.createProject);

// PUT /api/projects/:id - Update project
router.put('/:id', projectValidation.update, projectController.updateProject);

// DELETE /api/projects/:id - Delete project (soft delete by default, ?hard=true for permanent)
router.delete('/:id', projectValidation.delete, projectController.deleteProject);

module.exports = router;