import express from "express";
import { deleteProduct, getAdminProducts, getAllCategories, getAllProducts, getlatestProducts, getSingleProduct, newProduct, updateProduct } from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";
import { adminOnly } from "../middlewares/auth.js";
const app = express.Router();
//create new [produt] - /api/v1/products/new
app.post("/new", adminOnly, singleUpload, newProduct);
//get all products with filters - /api/v1/products/all
app.get("/all", getAllProducts);
//get letest products - /api/v1/products/latest
app.get("/latest", getlatestProducts);
//get categories - /api/v1/products/categories
app.get("/categories", getAllCategories);
//get admin products - /api/v1/products/admin-products
app.get("/admin-products", adminOnly, getAdminProducts);
app.route("/:id").get(getSingleProduct).put(adminOnly, singleUpload, updateProduct).delete(adminOnly, deleteProduct);
export default app;
//# sourceMappingURL=products.js.map