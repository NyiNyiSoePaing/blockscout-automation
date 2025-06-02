const blockscoutService = require('../services/blockscoutService');

class BlockscoutController {
  async getAllBlockscoutServers(req, res, next) {
    try {
      const servers = await blockscoutService.getAllBlockscoutServers();
      res.json({
        success: true,
        message: 'Blockscout servers retrieved successfully',
        data: servers,
        count: servers.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getBlockscoutServerById(req, res, next) {
    try {
      const { id } = req.params;
      const server = await blockscoutService.getBlockscoutServerById(id);
      res.json({
        success: true,
        message: 'Blockscout server retrieved successfully',
        data: server
      });
    } catch (error) {
      if (error.message === 'Blockscout server not found') {
        return res.status(404).json({
          success: false,
          message: 'Blockscout server not found'
        });
      }
      next(error);
    }
  }

  async getBlockscoutServersByProject(req, res, next) {
    try {
      const { projectId } = req.params;
      const servers = await blockscoutService.getBlockscoutServersByProject(projectId);
      res.json({
        success: true,
        message: 'Blockscout servers retrieved successfully',
        data: servers,
        count: servers.length
      });
    } catch (error) {
      next(error);
    }
  }

  async createBlockscoutServer(req, res, next) {
    try {
      const server = await blockscoutService.createBlockscoutServer(req.body);
      res.status(201).json({
        success: true,
        message: 'Blockscout server created successfully',
        data: server
      });
    } catch (error) {
      if (error.message === 'Project not found') {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      if (error.message.includes('already has a') && error.message.includes('server')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  async updateBlockscoutServer(req, res, next) {
    try {
      const { id } = req.params;
      const server = await blockscoutService.updateBlockscoutServer(id, req.body);
      res.json({
        success: true,
        message: 'Blockscout server updated successfully',
        data: server
      });
    } catch (error) {
      if (error.message === 'Blockscout server not found') {
        return res.status(404).json({
          success: false,
          message: 'Blockscout server not found'
        });
      }
      if (error.message.includes('already has a') && error.message.includes('server')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  async deleteBlockscoutServer(req, res, next) {
    try {
      const { id } = req.params;
      const { hard } = req.query;
      
      if (hard === 'true') {
        await blockscoutService.hardDeleteBlockscoutServer(id);
        res.json({
          success: true,
          message: 'Blockscout server permanently deleted successfully'
        });
      } else {
        await blockscoutService.deleteBlockscoutServer(id);
        res.json({
          success: true,
          message: 'Blockscout server deleted successfully'
        });
      }
    } catch (error) {
      if (error.message === 'Blockscout server not found') {
        return res.status(404).json({
          success: false,
          message: 'Blockscout server not found'
        });
      }
      next(error);
    }
  }
}

module.exports = new BlockscoutController();