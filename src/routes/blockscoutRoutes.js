const express = require('express');
const router = express.Router();
const blockscoutController = require('../controllers/blockscoutController');
const { blockscoutValidation } = require('../middleware/validation');

// GET /api/blockscout - Get all blockscout servers
router.get('/', blockscoutController.getAllBlockscoutServers);

// GET /api/blockscout/:id - Get blockscout server by ID
router.get('/:id', blockscoutController.getBlockscoutServerById);

// GET /api/blockscout/project/:projectId - Get blockscout servers by project
router.get('/project/:projectId', blockscoutController.getBlockscoutServersByProject);

// POST /api/blockscout - Create new blockscout server
router.post('/', blockscoutValidation.create, blockscoutController.createBlockscoutServer);

// PUT /api/blockscout/:id - Update blockscout server
router.put('/:id', blockscoutValidation.update, blockscoutController.updateBlockscoutServer);

// DELETE /api/blockscout/:id - Delete blockscout server (soft delete by default, ?hard=true for permanent)
router.delete('/:id', blockscoutValidation.delete, blockscoutController.deleteBlockscoutServer);

module.exports = router;