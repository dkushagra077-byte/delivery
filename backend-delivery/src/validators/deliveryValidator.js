const { body, param } = require('express-validator');

const updateDeliveryStatusValidator = [
  param('id')
    .notEmpty().withMessage('Delivery ID is required'),
  body('status')
    .notEmpty().withMessage('Target status is required')
    .isIn([
      'ORDER_PLACED',
      'ORDER_CONFIRMED',
      'DRIVER_ASSIGNED',
      'PICKUP_PENDING',
      'PICKED_UP',
      'IN_TRANSIT',
      'NEAR_DESTINATION',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'FAILED'
    ]).withMessage('Invalid delivery status provided'),
  body('notes')
    .optional()
    .isString(),
  body('proofOfDelivery')
    .optional()
    .isString(),
  body('signature')
    .optional()
    .isString()
];

const assignDriverValidator = [
  param('id')
    .notEmpty().withMessage('Delivery/Order ID is required'),
  body('driverId')
    .notEmpty().withMessage('Driver ID is required')
];

module.exports = {
  updateDeliveryStatusValidator,
  assignDriverValidator
};
