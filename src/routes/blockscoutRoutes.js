const express = require('express');
const router = express.Router();
const blockscoutController = require('../controllers/blockscoutController');
const { blockscoutValidation } = require('../middleware/validation');

// GET /api/blockscout - Get all Blockscout servers
router.get('/', blockscoutController.getAllBlockscoutServers);

// GET /api/blockscout/:id - Get Blockscout server by ID
router.get('/:id', blockscoutController.getBlockscoutServerById);

// GET /api/blockscout/project/:projectId - Get Blockscout servers by project
router.get('/project/:projectId', blockscoutController.getBlockscoutServersByProject);

// POST /api/blockscout - Create new Blockscout server
router.post('/', blockscoutValidation.create, blockscoutController.createBlockscoutServer);

// PUT /api/blockscout/:id - Update Blockscout server
router.put('/:id', blockscoutValidation.update, blockscoutController.updateBlockscoutServer);

// DELETE /api/blockscout/:id - Delete Blockscout server (soft delete by default, ?hard=true for permanent)
router.delete('/:id', blockscoutValidation.delete, blockscoutController.deleteBlockscoutServer);

// POST /api/blockscout/:id/domain - Set domain and create SSL certificate for Blockscout server
router.post('/:id/domainCreate', blockscoutValidation.domain, blockscoutController.createSslCertificate);

module.exports = router;