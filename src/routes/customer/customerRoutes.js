const express = require('express');

const router = express.Router();

const controller = require('../../controllers/customer/customerController');

const { checkAuthAndUserHasUserPermission } = require('../../middlewares/auth');

router.post('/new', checkAuthAndUserHasUserPermission, controller.createCustomer);
router.put('/update/:id', checkAuthAndUserHasUserPermission, controller.updateCustomer);
router.delete('/delete/:id', checkAuthAndUserHasUserPermission, controller.deleteCustomer);
router.get('/find/id/:id', checkAuthAndUserHasUserPermission, controller.getCustomerById);
router.get('/find/all', checkAuthAndUserHasUserPermission, controller.listCustomers);
router.get('/find/query', checkAuthAndUserHasUserPermission, controller.getCustomerByCodeNameOrPhone);


module.exports = router;