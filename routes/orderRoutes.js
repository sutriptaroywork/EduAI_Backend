const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController')


router.get('/:id', authMiddleware, orderController.orderDetails);

module.exports = router;