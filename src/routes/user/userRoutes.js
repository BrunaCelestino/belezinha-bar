const express = require('express');

const router = express.Router();

const controller = require('../../controllers/user/userController');

const { validatePasswordUsername, hashPassword } = require('../../helpers/validationHelpers');
const { checkAuthAndAdminPermission, checkAuthAndUserHasUserPermission } = require('../../middlewares/auth');

router.post('/new', validatePasswordUsername, hashPassword, controller.create);
router.put('/update/:id', checkAuthAndUserHasUserPermission, validatePasswordUsername, hashPassword, controller.update);
router.delete('/delete/:id', checkAuthAndAdminPermission, controller.deleteUser);
router.get('/find/username', checkAuthAndAdminPermission, controller.getOneUserByUsername);
router.get('/find/all', checkAuthAndAdminPermission, controller.getAllUsers);
router.get('/find/id/:id', checkAuthAndAdminPermission, controller.getOneUserById);
router.post('/login', controller.userSignIn);

module.exports = router;