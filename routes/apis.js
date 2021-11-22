const express = require('express');
const productController = require('../controllers/productController');
const clientController = require('../controllers/clientController');

//define a router and create routes
const router = express.Router();

//routes for dynamic processing of products
//-----------------------------------------------
//route for listing all products
router.get('/api/catalogue', productController.getCatalogue);
router.get('/api/article/:id', productController.getProductByID);


//routes for dynamic processing of clients
//-----------------------------------------------
//route for login
router.post('/api/login', clientController.loginControl);
//route for registration
router.post('/api/register', clientController.registerControl);
//export router
router.get('/api/clientDetails', clientController.getClient);
module.exports = router;