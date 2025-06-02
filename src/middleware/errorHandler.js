const { Prisma } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          message: 'A record with this value already exists',
          error: 'Duplicate entry'
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          message: 'Record not found',
          error: 'Not found'
        });
      case 'P2003':
        return res.status(400).json({
          success: false,
          message: 'Foreign key constraint failed',
          error: 'Invalid reference'
        });
      default:
        return res.status(500).json({
          success: false,
          message: 'Database error occurred',
          error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid data provided',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Validation error'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong'
  });
};

module.exports = errorHandler;