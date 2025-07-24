import express from "express";
import { listProducts, newProducts, delProducts, listProductsByName, updateProducts, listProductsById } from "../controllers/productsController.js";

//Create studentRouter
const productsRouter = express.Router();

productsRouter.get('/', listProducts)

productsRouter.get('/:productId', listProductsById)

productsRouter.get('/search/:query', listProductsByName)

productsRouter.post('/', newProducts)

productsRouter.delete('/:productId', delProducts)

productsRouter.put('/update/:productId', updateProducts)

export default productsRouter;