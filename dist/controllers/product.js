import { rm } from "node:fs";
import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import { faker } from "@faker-js/faker";
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
        message: "product created successfully",
    });
});
export const getlatestProducts = TryCatch(async (req, res, next) => {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    res.status(201).json({
        success: true,
        products,
    });
});
export const getAllCategories = TryCatch(async (req, res, next) => {
    const categories = await Product.distinct("category");
    res.status(201).json({
        success: true,
        categories,
    });
});
export const getAdminProducts = TryCatch(async (req, res, next) => {
    const products = await Product.find({});
    res.status(201).json({
        success: true,
        products,
    });
});
export const getSingleProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product)
        return next(new Error("product not found for this id", 404));
    res.status(201).json({
        success: true,
        product,
    });
});
export const updateProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    const product = await Product.findById(id);
    if (!product)
        return next(new Error("invalid id", 404));
    if (photo) {
        rm(product.photo, () => {
            console.log("old photo deleted");
        });
        product.photo = photo.path;
    }
    if (name)
        product.name = name;
    if (price)
        product.price = price;
    if (stock)
        product.stock = stock;
    if (category)
        product.category = category.toLowerCase();
    await product.save();
    res.status(200).json({
        success: true,
        message: "product updated successfully",
    });
});
export const deleteProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product)
        return next(new Error("poduct not found for this id", 404));
    rm(product.photo, () => {
        console.log("Photo deleted for the product");
    });
    await product.deleteOne();
    res.status(201).json({
        success: true,
        message: "product deleted successfully",
    });
});
export const getAllProducts = TryCatch(async (req, res, next) => {
    const { search, price, category, sort } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = limit * (page - 1);
    const baseQuery = {};
    if (search) {
        baseQuery.name = { $regex: search, $options: "i" };
    }
    if (price) {
        baseQuery.price = { $lte: Number(price) };
    }
    if (category) {
        baseQuery.category = category;
    }
    const [products, filteredOnlyProduct] = await Promise.all([
        Product.find(baseQuery)
            .sort(sort && { price: sort === "asc" ? 1 : -1 })
            .limit(limit).skip(skip),
        Product.find(baseQuery)
    ]);
    const totalPages = Math.ceil(filteredOnlyProduct.length / limit);
    res.status(201).json({
        success: true,
        products,
        totalPages,
    });
});
const generateRandomProducts = async (count = 10) => {
    const products = [];
    for (let i = 0; i < count; i++) {
        const product = {
            name: faker.commerce.productName(),
            photo: "uploads\\a7d05fba-2ca8-4c58-b91d-9fd39b4adbc1.avif",
            price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
            stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
            category: faker.commerce.department(),
            createdAt: new Date(faker.date.past()),
            updatedAt: new Date(faker.date.recent()),
            _v: 0,
        };
        products.push(product);
    }
    await Product.create(products);
    console.log({ success: true });
};
generateRandomProducts(40);
//# sourceMappingURL=product.js.map