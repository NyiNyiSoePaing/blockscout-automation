const rpcService = require('../services/rpcService');

class RpcController {
  async getAllRpcServers(req, res, next) {
    try {
      const servers = await rpcService.getAllRpcServers();
      res.json({
        success: true,
        message: 'RPC servers retrieved successfully',
        data: servers,
        count: servers.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getRpcServerById(req, res, next) {
    try {
      const { id } = req.params;
      const server = await rpcService.getRpcServerById(id);
      res.json({
        success: true,
        message: 'RPC server retrieved successfully',
        data: server
      });
    } catch (error) {
      if (error.message === 'RPC server not found') {
        return res.status(404).json({
          success: false,
          message: 'RPC server not found'
        });
      }
      next(error);
    }
  }

  async getRpcServersByProject(req, res, next) {
    try {
      const { projectId } = req.params;
      const servers = await rpcService.getRpcServersByProject(projectId);
      res.json({
        success: true,
        message: 'RPC servers retrieved successfully',
        data: servers,
        count: servers.length
      });
    } catch (error) {
      next(error);
    }
  }

  async createRpcServer(req, res, next) {
    try {
      const server = await rpcService.createRpcServer(req.body);
      res.status(201).json({
        success: true,
        message: 'RPC server created successfully',
        data: server
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

  async updateRpcServer(req, res, next) {
    try {
      const { id } = req.params;
      const server = await rpcService.updateRpcServer(id, req.body);
      res.json({
        success: true,
        message: 'RPC server updated successfully',
        data: server
      });
    } catch (error) {
      if (error.message === 'RPC server not found') {
        return res.status(404).json({
          success: false,
          message: 'RPC server not found'
        });
      }
      next(error);
    }
  }

  async deleteRpcServer(req, res, next) {
    try {
      const { id } = req.params;
      const { hard } = req.query;
      
      if (hard === 'true') {
        await rpcService.hardDeleteRpcServer(id);
        res.json({
          success: true,
          message: 'RPC server permanently deleted successfully'
        });
      } else {
        await rpcService.deleteRpcServer(id);
        res.json({
          success: true,
          message: 'RPC server deleted successfully'
        });
      }
    } catch (error) {
      if (error.message === 'RPC server not found') {
        return res.status(404).json({
          success: false,
          message: 'RPC server not found'
        });
      }
      next(error);
    }
  }
}

module.exports = new RpcController();