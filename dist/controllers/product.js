import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
export const newProduct = TryCatch(async (req, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;
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
//# sourceMappingURL=product.js.map