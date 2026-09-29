const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createOrderValidator } = require('../validators/orderValidator');

router.use(authenticate);

router.post('/', requireRole(['CUSTOMER', 'ADMIN']), validate(createOrderValidator), OrderController.createOrder);
router.get('/', OrderController.getAllOrders);
router.get('/:id', OrderController.getOrderById);
router.post('/:id/cancel', OrderController.cancelOrder);

module.exports = router;
