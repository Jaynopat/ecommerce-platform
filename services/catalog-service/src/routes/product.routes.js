const express    = require('express');
const router     = express.Router();
const product    = require('../controllers/product.controller');

// Public routes — no JWT needed
router.get('/',    product.listProducts);
router.get('/:id', product.getProduct);

// Protected routes — JWT is validated by the gateway before reaching here
router.post('/',    product.createProduct);
router.put('/:id',  product.updateProduct);
router.delete('/:id', product.deleteProduct);

module.exports = router;