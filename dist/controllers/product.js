import { rm } from "node:fs";
import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
export const newProduct = TryCatch(async (req, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    if (!photo)
        return next(new Error("Please upload a photo for the product", 400));
    if (!price || !stock || !category || !name) {
        rm(photo.path, () => {
            console.log("File deleted");
        });
        return next(new Error("Please provide all fields", 400));
    }
    await Product.create({
        name: name,
        price: price,
        stock: stock,
        category: category.toLowerCase(),
        photo: photo?.path,
    });
    res.status(201).json({
        success: true,
        message: "product created successfully"
    });
});
export const getlatestProducts = TryCatch(async (req, res, next) => {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    res.status(201).json({
        success: true,
        products,
    });
});
//# sourceMappingURL=product.js.map