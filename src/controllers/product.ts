import { rm } from "node:fs";
import type { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import type {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/feature.js";
import ErrorHandler from "../utils/utility-class.js";
//import {faker} from "@faker-js/faker";


//revalidate on New product creation, update and delete, and also on new order 
export const getlatestProducts = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("latest-product")) {
    products = JSON.parse(myCache.get("latest-product") as string);
  }
  else{
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    myCache.set("latest-product", JSON.stringify(products));
  }

  res.status(200).json({
    success: true,
    products,
  });
});


//revalidate on New product creation, update and delete, and also on new order 
export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;

  if(myCache.has("categories")){
    categories = JSON.parse(myCache.get("categories") as string);
  }
  else{
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories))
  }
  
  res.status(200).json({
    success: true,
    categories,
  });
});

//revalidate on New product creation, update and delete, and also on new order
export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products;
  if(myCache.has("admin-products")){
    products = JSON.parse(myCache.get("admin-products") as string);
  }
  else{
    products = await Product.find({});
    myCache.set("admin-products", JSON.stringify(products));
  }

  res.status(200).json({
    success: true,
    products,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;

  if(myCache.has(`product-${id}`)){
    product = JSON.parse(myCache.get(`product-${id}`) as string)
  }
  else{
    product = await Product.findById(id);

    if (!product) return next(new ErrorHandler("product not found for this id", 404));
    myCache.set(`product-${id}`, JSON.stringify(product));
  }
  
  res.status(201).json({
    success: true,
    product,
  });
});

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    if (!photo)
      return next(new ErrorHandler("Please upload a photo for the product", 400));
    if (!price || !stock || !category || !name) {
      rm(photo.path, () => {
        console.log("File deleted");
      });
      return next(new ErrorHandler("Please provide all fields", 400));
    }

    await Product.create({
      name: name,
      price: price,
      stock: stock,
      category: category.toLowerCase(),
      photo: photo?.path,
    });

    invalidateCache({product: true, admin: true,});

    res.status(201).json({
      success: true,
      message: "product created successfully",
    });
  },
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const { name, price, stock, category } = req.body;
  const photo = req.file;

  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("invalid id", 404));

  if (photo) {
    rm(product.photo!, () => {
      console.log("old photo deleted");
    });
    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category.toLowerCase();
  await product.save();

  invalidateCache({product: true, productId: String(product._id), admin: true,});

  res.status(200).json({
    success: true,
    message: "product updated successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("poduct not found for this id", 404));

  rm(product.photo!, () => {
    console.log("Photo deleted for the product");
  });

  await product.deleteOne();

   invalidateCache({product: true, productId: String(product._id), admin: true,});

  res.status(201).json({
    success: true,
    message: "product deleted successfully",
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, price, category, sort } = req.query;
    const page = Number(req.query.page) || 1;

    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;

    const skip = limit * (page - 1);

    const baseQuery: BaseQuery = {};

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
        .limit(limit)
        .skip(skip),
      Product.find(baseQuery),
    ]);

    const totalPages = Math.ceil(filteredOnlyProduct.length / limit);

    res.status(201).json({
      success: true,
      products,
      totalPages,
    });
  },
);

// const generateRandomProducts = async(count: number = 10) {
//   const products = [];
//   for(let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       photo: "uploads\\a7d05fba-2ca8-4c58-b91d-9fd39b4adbc1.avif",
//       price: faker.commerce.price({min: 1500, max: 80000, dec: 0}),
//       stock: faker.commerce.price({min: 0, max: 100, dec: 0}),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updatedAt: new Date(faker.date.recent()),
//       _v: 0,
//     };
//     products.push(product)
//   }
//   await Product.create(products);
//   console.log({success: true});
// }

// const deleteRandomsProducts = async (count: number = 10) => {
// const products = await Product.find({}).skip(2);

// for (let i = 0; i < products.length; i++) {
// const product = products[i];
// await product.deleteOne();
// }

// console.log({ succecss: true });
// };

// deleteRandomsProducts(131);
