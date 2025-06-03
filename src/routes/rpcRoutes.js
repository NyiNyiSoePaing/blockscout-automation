const express = require('express');
const router = express.Router();
const rpcController = require('../controllers/rpcController');
const { rpcValidation } = require('../middleware/validation');

// GET /api/rpc - Get all RPC servers
router.get('/', rpcController.getAllRpcServers);

// GET /api/rpc/:id - Get RPC server by ID
router.get('/:id', rpcController.getRpcServerById);

// GET /api/rpc/project/:projectId - Get RPC servers by project
router.get('/project/:projectId', rpcController.getRpcServersByProject);

// POST /api/rpc - Create new RPC server
router.post('/', rpcValidation.create, rpcController.createRpcServer);

// PUT /api/rpc/:id - Update RPC server
router.put('/:id', rpcValidation.update, rpcController.updateRpcServer);

// DELETE /api/rpc/:id - Delete RPC server (soft delete by default, ?hard=true for permanent)
router.delete('/:id', rpcValidation.delete, rpcController.deleteRpcServer);

// POST /api/rpc/:id/domain - Set domain and create SSL certificate for RPC server
router.post('/:id/domainCreate', rpcValidation.domain, rpcController.createSslCertificate);

module.exports = router;
