const { body } = require('express-validator');

const recordLocationValidator = [
  body('deliveryId')
    .notEmpty().withMessage('Delivery ID is required'),
  body('latitude')
    .isFloat({ min: -90, max: 90 }).withMessage('Valid latitude between -90 and 90 is required'),
  body('longitude')
    .isFloat({ min: -180, max: 180 }).withMessage('Valid longitude between -180 and 180 is required'),
  body('speed')
    .optional()
    .isFloat({ min: 0 }).withMessage('Speed must be a non-negative number'),
  body('heading')
    .optional()
    .isFloat({ min: 0, max: 360 }).withMessage('Heading must be between 0 and 360 degrees'),
  body('accuracy')
    .optional()
    .isFloat({ min: 0 }).withMessage('Accuracy must be a non-negative number')
];

module.exports = {
  recordLocationValidator
};
