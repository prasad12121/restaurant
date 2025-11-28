import express from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PRODUCT ROUTES
|--------------------------------------------------------------------------
*/

// CREATE product (with image upload)
router.post("/", upload.single("image"), createProduct);

// GET all products
router.get("/", getProducts);

// UPDATE product (image optional + toggle availability)
router.put("/:id", upload.single("image"), updateProduct);

// DELETE product
router.delete("/:id", deleteProduct);

export default router;
