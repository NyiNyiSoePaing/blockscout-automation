const express = require('express');
const router = express.Router();

// Import route modules
const projectRoutes = require('./projectRoutes');
const blockscoutRoutes = require('./blockscoutRoutes');
const rpcRoutes = require('./rpcRoutes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Blockscout API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/projects', projectRoutes);
router.use('/blockscout', blockscoutRoutes);
router.use('/rpc', rpcRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

module.exports = router;