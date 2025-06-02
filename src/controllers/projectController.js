const projectService = require('../services/projectService');

class ProjectController {
  async getAllProjects(req, res, next) {
    try {
      const projects = await projectService.getAllProjects();
      res.json({
        success: true,
        message: 'Projects retrieved successfully',
        data: projects,
        count: projects.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectById(req, res, next) {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);
      res.json({
        success: true,
        message: 'Project retrieved successfully',
        data: project
      });
    } catch (error) {
      if (error.message === 'Project not found') {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      next(error);
    }
  }

  async createProject(req, res, next) {
    try {
      const project = await projectService.createProject(req.body);
      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      if (error.message === 'Project with this name already exists') {
        return res.status(409).json({
          success: false,
          message: 'Project with this name already exists'
        });
      }
      next(error);
    }
  }

  async updateProject(req, res, next) {
    try {
      const { id } = req.params;
      const project = await projectService.updateProject(id, req.body);
      res.json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error) {
      if (error.message === 'Project not found') {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      if (error.message === 'Project with this name already exists') {
        return res.status(409).json({
          success: false,
          message: 'Project with this name already exists'
        });
      }
      next(error);
    }
  }

  async deleteProject(req, res, next) {
    try {
      const { id } = req.params;
      const { hard } = req.query;
      
      if (hard === 'true') {
        await projectService.hardDeleteProject(id);
        res.json({
          success: true,
          message: 'Project permanently deleted successfully'
        });
      } else {
        await projectService.deleteProject(id);
        res.json({
          success: true,
          message: 'Project deleted successfully'
        });
      }
    } catch (error) {
      if (error.message === 'Project not found') {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      next(error);
    }
  }
}

module.exports = new ProjectController();