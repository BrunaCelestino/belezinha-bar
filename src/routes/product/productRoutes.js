    const express = require('express');
    
    const router = express.Router();
    
    const controller = require('../../controllers/product/productController');
    
    const { checkAuthAndUserHasUserPermission } = require('../../middlewares/auth');
    
    router.post('/new', checkAuthAndUserHasUserPermission, controller.createProduct);
    router.get('/find/all', checkAuthAndUserHasUserPermission, controller.getAllProducts);
    router.get('/find/id/:id', checkAuthAndUserHasUserPermission, controller.getProductById);
    router.put('/update/:id', checkAuthAndUserHasUserPermission, controller.updateProduct); 
    router.delete('/delete/:id', checkAuthAndUserHasUserPermission, controller.deleteProduct);
    router.get('/find/category/:category', checkAuthAndUserHasUserPermission, controller.getProductsByCategory);
    router.get('/find/availability/:available', checkAuthAndUserHasUserPermission, controller.getProductsByAvailability);
    router.get('/find/name', checkAuthAndUserHasUserPermission, controller.getProductByName); 
    router.post('/tags/add/:id', checkAuthAndUserHasUserPermission, controller.addTagsToProduct);
    router.post('/tags/remove/:id', checkAuthAndUserHasUserPermission, controller.removeTagsFromProduct);
    router.get('/tags/find', checkAuthAndUserHasUserPermission, controller.getProductsByTags);
    
    module.exports = router;