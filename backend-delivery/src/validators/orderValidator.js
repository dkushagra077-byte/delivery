const { body, param } = require('express-validator');

const createOrderValidator = [
  body('recipientName')
    .trim()
    .notEmpty().withMessage('Recipient name is required'),
  body('recipientPhone')
    .trim()
    .notEmpty().withMessage('Recipient phone number is required'),
  body('packageDescription')
    .trim()
    .notEmpty().withMessage('Package description is required'),
  body('pickupAddressText')
    .trim()
    .notEmpty().withMessage('Pickup address text is required'),
  body('deliveryAddressText')
    .trim()
    .notEmpty().withMessage('Delivery destination address is required'),
  body('pickupLatitude')
    .isFloat({ min: -90, max: 90 }).withMessage('Valid pickup latitude is required'),
  body('pickupLongitude')
    .isFloat({ min: -180, max: 180 }).withMessage('Valid pickup longitude is required'),
  body('deliveryLatitude')
    .isFloat({ min: -90, max: 90 }).withMessage('Valid delivery latitude is required'),
  body('deliveryLongitude')
    .isFloat({ min: -180, max: 180 }).withMessage('Valid delivery longitude is required'),
  body('packageWeight')
    .optional()
    .isFloat({ min: 0.1 }).withMessage('Package weight must be at least 0.1 kg'),
  body('priority')
    .optional()
    .isIn(['STANDARD', 'EXPRESS', 'URGENT']).withMessage('Priority must be STANDARD, EXPRESS, or URGENT')
];

module.exports = {
  createOrderValidator
};
