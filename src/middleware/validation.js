const { body, param, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Project validation rules
const projectValidation = {
  create: [
    body('name')
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    handleValidationErrors
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('Valid project ID is required'),
    body('name')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    handleValidationErrors
  ],
  delete: [
    param('id').isInt({ min: 1 }).withMessage('Valid project ID is required'),
    handleValidationErrors
  ]
};

// BlockscoutServer validation rules
const blockscoutValidation = {
  create: [
    body('projectId').isInt({ min: 1 }).withMessage('Valid project ID is required'),
    body('networkType')
      .isIn(['mainnet', 'testnet'])
      .withMessage('Network type must be either mainnet or testnet'),
    body('serverUrl')
      .isURL()
      .withMessage('Valid server URL is required'),
    body('ipAddress')
      .isIP()
      .withMessage('Valid IP address is required'),
    body('chainId')
      .optional()
      .isString()
      .withMessage('Chain ID must be a string'),
    body('currency')
      .optional()
      .isString()
      .withMessage('Currency must be a string'),
    body('logo_url')
      .optional()
      .isURL()
      .withMessage('Logo URL must be a valid URL'),
    body('rpc_url')
      .optional()
      .isURL()
      .withMessage('RPC URL must be a valid URL'),
    body('network_link')
      .optional()
      .isString()
      .withMessage('Network links must be a string'),
    body('footer_link')
      .optional()
      .isString()
      .withMessage('Footer links must be a string'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    handleValidationErrors
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('Valid blockscout server ID is required'),
    body('networkType')
      .optional()
      .isIn(['mainnet', 'testnet'])
      .withMessage('Network type must be either mainnet or testnet'),
    body('serverUrl')
      .optional()
      .isURL()
      .withMessage('Server URL must be valid'),
    body('ipAddress')
      .optional()
      .isIP()
      .withMessage('IP address must be valid'),
    body('chainId')
      .optional()
      .isString()
      .withMessage('Chain ID must be a string'),
    body('currency')
      .optional()
      .isString()
      .withMessage('Currency must be a string'),
    body('logo_url')
      .optional()
      .isURL()
      .withMessage('Logo URL must be a valid URL'),
    body('rpc_url')
      .optional()
      .isURL()
      .withMessage('RPC URL must be a valid URL'),
    body('network_link')
      .optional()
      .isString()
      .withMessage('Network links must be a string'),
    body('footer_link')
      .optional()
      .isString()
      .withMessage('Footer links must be a string'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    handleValidationErrors
  ],
  delete: [
    param('id').isInt({ min: 1 }).withMessage('Valid blockscout server ID is required'),
    handleValidationErrors
  ]
};

// RpcServer validation rules
const rpcValidation = {
  create: [
    body('projectId').isInt({ min: 1 }).withMessage('Valid project ID is required'),
    body('serverUrl')
      .isURL()
      .withMessage('Valid server URL is required'),
    body('ipAddress')
      .isIP()
      .withMessage('Valid IP address is required'),
    body('chainId')
      .optional()
      .isString()
      .withMessage('Chain ID must be a string'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    handleValidationErrors
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('Valid RPC server ID is required'),
    body('serverUrl')
      .optional()
      .isURL()
      .withMessage('Server URL must be valid'),
    body('ipAddress')
      .optional()
      .isIP()
      .withMessage('IP address must be valid'),
    body('chainId')
      .optional()
      .isString()
      .withMessage('Chain ID must be a string'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    handleValidationErrors
  ],
  delete: [
    param('id').isInt({ min: 1 }).withMessage('Valid RPC server ID is required'),
    handleValidationErrors
  ]
};

module.exports = {
  projectValidation,
  blockscoutValidation,
  rpcValidation,
  handleValidationErrors
};