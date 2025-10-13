const express = require('express');

const router = express.Router();

const controller = require('../../controllers/order/orderController');

const { checkAuthAndUserHasUserPermission } = require('../../middlewares/auth');

router.post('/new', checkAuthAndUserHasUserPermission, controller.createOrder);
router.get('/find/kitchen', checkAuthAndUserHasUserPermission, controller.getKitchenOrders);
router.get('/find/bar', checkAuthAndUserHasUserPermission, controller.getBarOrders);
router.get('/find/customer', checkAuthAndUserHasUserPermission, controller.getAllOrdersByCustomerCode);
router.get('/orderNumber', checkAuthAndUserHasUserPermission, controller.getOrderNumber);
router.get('/history', checkAuthAndUserHasUserPermission, controller.getOrderHistory);
router.patch('/update/:id', checkAuthAndUserHasUserPermission, controller.updateOrderStatus);
router.patch('/addProduct/:id', checkAuthAndUserHasUserPermission, controller.addProductToDeliveredOrder);
router.patch('/removeProduct/:id', checkAuthAndUserHasUserPermission, controller.removeProductFromDeliveredOrder);
router.delete('/delete/all', checkAuthAndUserHasUserPermission, controller.removeAllOrders);

module.exports = router;