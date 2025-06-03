const projectService = require('../services/projectService');
const rpcService = require('../services/rpcService');
const rpcController = require('./rpcController');

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
      
      // Check if project exists before starting deletion process
      const project = await projectService.getProjectById(id);
      
      // Respond immediately to the client
      res.json({
        success: true,
        message: 'Project deletion initiated. Cleaning up all associated resources...'
      });

      // Start cleanup process in the background
      setImmediate(async () => {
        try {
          await this.cleanupProjectResources(id);
        } catch (error) {
          console.error(`Error during project ${id} cleanup:`, error);
        }
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

  async cleanupProjectResources(projectId) {
    try {
      console.log(`Starting cleanup for project ${projectId}`);
      
      // Get all RPC servers associated with this project
      const rpcServers = await rpcService.getRpcServersByProject(projectId);
      
      if (rpcServers.length > 0) {
        console.log(`Found ${rpcServers.length} RPC servers to cleanup for project ${projectId}`);
        
        // Delete all RPC servers and their droplets
        const deletePromises = rpcServers.map(async (server) => {
          try {
            console.log(`Cleaning up RPC server ${server.id}`);
            
            // Delete DigitalOcean droplet
            const dropletDeleted = await this.deleteDigitalOceanDroplet(server.id);
            
            if (dropletDeleted) {
              console.log(`Droplet cleanup completed for server ${server.id}`);
            } else {
              console.warn(`Droplet cleanup failed for server ${server.id}, but continuing`);
            }
            
            // Delete from database
            await rpcService.deleteRpcServer(server.id);
            console.log(`RPC server ${server.id} deleted from database`);
            
          } catch (error) {
            console.error(`Error cleaning up RPC server ${server.id}:`, error);
            // Continue with other servers even if one fails
          }
        });
        
        // Wait for all RPC server cleanups to complete
        await Promise.allSettled(deletePromises);
        console.log(`All RPC servers cleanup completed for project ${projectId}`);
      } else {
        console.log(`No RPC servers found for project ${projectId}`);
      }
      
      // Finally, delete the project itself
      await projectService.deleteProject(projectId);
      console.log(`Project ${projectId} permanently deleted`);
      
    } catch (error) {
      console.error(`Error during project ${projectId} cleanup:`, error);
      
      // Try to delete the project even if RPC cleanup failed
      try {
        await projectService.deleteProject(projectId);
        console.log(`Project ${projectId} deleted from database despite cleanup errors`);
      } catch (dbError) {
        console.error(`Failed to delete project ${projectId} from database:`, dbError);
      }
    }
  }

  async deleteDigitalOceanDroplet(serverId) {
    try {
      const dropletId = await this.findDropletByServerId(serverId);
      
      if (!dropletId) {
        console.log(`No droplet found for server ${serverId}`);
        return true;
      }

      console.log(`Deleting droplet ${dropletId} for server ${serverId}`);

      const axios = require('axios');
      await axios.delete(
        `https://api.digitalocean.com/v2/droplets/${dropletId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.DO_API_TOKEN}`
          }
        }
      );

      console.log(`Droplet ${dropletId} deleted successfully`);
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`Droplet not found (already deleted?) for server ${serverId}`);
        return true;
      }
      
      console.error('Error deleting DigitalOcean droplet:', error.response?.data || error.message);
      return false;
    }
  }

  async findDropletByServerId(serverId) {
    try {
      const axios = require('axios');
      
      // First try to get droplet ID from database
      const server = await rpcService.getRpcServerById(serverId);
      if (server.dropletId) {
        return server.dropletId;
      }

      // Fallback: search by tag if dropletId is not stored
      const response = await axios.get(
        `https://api.digitalocean.com/v2/droplets?tag_name=server-id-${serverId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.DO_API_TOKEN}`
          }
        }
      );

      const droplets = response.data.droplets;
      if (droplets.length > 0) {
        return droplets[0].id;
      }

      // Final fallback: search by name pattern
      const allDropletsResponse = await axios.get(
        'https://api.digitalocean.com/v2/droplets',
        {
          headers: {
            'Authorization': `Bearer ${process.env.DO_API_TOKEN}`
          }
        }
      );

      const matchingDroplet = allDropletsResponse.data.droplets.find(
        droplet => droplet.name === `rpc-server-${serverId}`
      );

      return matchingDroplet ? matchingDroplet.id : null;
    } catch (error) {
      console.error('Error finding droplet:', error.response?.data || error.message);
      return null;
    }
  }
}

const projectController = new ProjectController();

// Bind all methods to ensure proper 'this' context
const boundController = {
  getAllProjects: projectController.getAllProjects.bind(projectController),
  getProjectById: projectController.getProjectById.bind(projectController),
  createProject: projectController.createProject.bind(projectController),
  updateProject: projectController.updateProject.bind(projectController),
  deleteProject: projectController.deleteProject.bind(projectController)
};

module.exports = boundController;