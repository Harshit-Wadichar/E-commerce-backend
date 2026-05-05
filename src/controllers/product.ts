import type { Request } from "express";
import { redis, redisTTL } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import { Review } from "../models/review.js";
import { User } from "../models/user.js";
import type {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import {
  deleteFromCloudinary,
  findAverageRatings,
  invalidateCache,
  uploadToCloudinary,
} from "../utils/feature.js";
import ErrorHandler from "../utils/utility-class.js";
import { request } from "node:http";
//import {faker} from "@faker-js/faker";

//revalidate on New product creation, update and delete, and also on new order
export const getlatestProducts = TryCatch(async (req, res, next) => {
  let products;
  products = await redis.get("latest-products");

  if (products) {
    products = JSON.parse(products);
  } else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    await redis.setex("latest-product",  redisTTL ,JSON.stringify(products));
  }

  res.status(200).json({
    success: true,
    products,
  });
});

//revalidate on New product creation, update and delete, and also on new order
export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;

  categories = await redis.get("categories");

  if (categories) {
    categories = JSON.parse(categories);
  } else {
    categories = await Product.distinct("category");
    await redis.setex("categories",  redisTTL, JSON.stringify(categories));
  }

  res.status(200).json({
    success: true,
    categories,
  });
});

//revalidate on New product creation, update and delete, and also on new order
export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products;

  products = await redis.get("all-products");
  if (products) {
    products = JSON.parse(products);
  } else {
    products = await Product.find({});
    await redis.setex("admin-products",  redisTTL, JSON.stringify(products));
  }

  res.status(200).json({
    success: true,
    products,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;
  const key = `product-${id}`;

  product = await redis.get(key);
  if (product) {
    product = JSON.parse(product);
  } else {
    product = await Product.findById(id);

    if (!product)
      return next(new ErrorHandler("product not found for this id", 404));
    await redis.setex(key, redisTTL, JSON.stringify(product));
  }

  res.status(201).json({
    success: true,
    product,
  });
});

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category, description } = req.body;
    const files = req.files;
    const photos = Array.isArray(files)
      ? files
      : [
          ...((files as { photo?: Express.Multer.File[] })?.photo ?? []),
          ...((files as { photos?: Express.Multer.File[] })?.photos ?? []),
        ];

    if (!photos.length)
      return next(
        new ErrorHandler("Please upload a photo for the product", 400),
      );

    if (photos.length < 1)
      return next(
        new ErrorHandler(
          "Please upload at least one photo for the product",
          400,
        ),
      );

    if (photos.length > 5)
      return next(
        new ErrorHandler("Please upload at most 5 photos for the product", 400),
      );

    if (!price || stock === undefined || !category || !name || !description)
      return next(new ErrorHandler("Please provide all fields", 400));

    const photosURL = await uploadToCloudinary(photos);

    await Product.create({
      name: name,
      price: price,
      description: description,
      stock: stock,
      category: category.toLowerCase(),
      photos: photosURL,
    });

    await invalidateCache({ product: true, admin: true });

    res.status(201).json({
      success: true,
      message: "product created successfully",
    });
  },
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const { name, price, stock, category, description } = req.body;
  const files = req.files;
  const photos = Array.isArray(files)
    ? files
    : [...((files as { photos?: Express.Multer.File[] })?.photos ?? [])];
  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("invalid id", 404));

  if (photos && photos.length > 0) {
    const photosURL = await uploadToCloudinary(photos);

    const ids = product.photos.map((photo) => photo.public_id);

    await deleteFromCloudinary(ids);

    product.photos = photosURL as unknown as any;
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category.toLowerCase();
  if (description) product.description = description;
  await product.save();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  res.status(200).json({
    success: true,
    message: "product updated successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id);

  if (!product)
    return next(new ErrorHandler("poduct not found for this id", 404));

  const ids = product.photos.map((photo) => photo.public_id);

  await deleteFromCloudinary(ids);

  await product.deleteOne();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  res.status(201).json({
    success: true,
    message: "product deleted successfully",
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, price, category, sort } = req.query;
    const page = Number(req.query.page) || 1;

    const key = `products-${search}-${sort}-${category}-${price}-${page}`;

    let products;
    let totalPages;

    const cachedData = await redis.get(key);

    if (cachedData) {
      const data = JSON.parse(cachedData);
      totalPages = data.totalPages;
      products = data.products;
    } else {
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

      const [productsFetched, filteredOnlyProduct] = await Promise.all([
        Product.find(baseQuery)
          .sort(sort && { price: sort === "asc" ? 1 : -1 })
          .limit(limit)
          .skip(skip),
        Product.find(baseQuery),
      ]);

      products = productsFetched;
      const totalPages = Math.ceil(filteredOnlyProduct.length / limit);

      await redis.setex(key, 30, JSON.stringify({ products, totalPages }));
    }

    res.status(201).json({
      success: true,
      products,
      totalPages,
    });
  },
);

export const getReview = TryCatch(async (req, res, next) => {
  let reviews;
  const key = `reviews-${req.params.id}`

  reviews = await redis.get(key);

  if (reviews) reviews = JSON.parse(reviews);
  else {
    reviews = await Review.find({ product:  req.params.id })
      .populate("user", "name photo")
      .sort({ updatedAt: -1 });

    await redis.setex(key,redisTTL, JSON.stringify(reviews));
  }

  res.status(200).json({
    success: true,
    reviews,
  });
});

export const newReview = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.query.id);
  if (!user) return next(new ErrorHandler("Not logged in bro", 404));

  const id = req.params.id;
  const product = await Product.findById(id);
  if (!product)
    return next(new ErrorHandler("poduct not found for this id", 404));

  const { rating, comment } = req.body;

  const alreadyReviewed = await Review.findOne({
    user: user._id,
    product: product._id,
  });

  if (alreadyReviewed) {
    alreadyReviewed.comment = comment;
    alreadyReviewed.rating = rating;
    await alreadyReviewed.save();
  } else {
    await Review.create({
      rating,
      comment,
      user: user._id,
      product: product._id,
    });
  }

  const { ratings, numOfReviews } = await findAverageRatings(product._id);

  product.ratings = ratings;
  product.numOfReviews = numOfReviews;

  await product.save();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
    review:true,
  });

  res.status(alreadyReviewed ? 200 : 201).json({
    success: true,
    message: alreadyReviewed
      ? "review updated successfully"
      : "review added successfully",
  });
});

export const deleteReview = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.query.id);
  if (!user) return next(new ErrorHandler("Not logged in bro", 404));

  const id = req.params.id;
  const review = await Review.findById(id);
  if (!review)
    return next(new ErrorHandler("Review not found for this id", 404));

  const isAuthenticUser = String(review.user) === String(user._id);

  if (!isAuthenticUser)
    return next(
      new ErrorHandler("You are not allowed to delete this review", 403),
    );

  await review.deleteOne();

  const product = await Product.findById(review.product);
  if (!product)
    return next(new ErrorHandler("Product not found for this review", 404));

  const { ratings, numOfReviews } = await findAverageRatings(product._id);

  product.ratings = ratings;
  product.numOfReviews = numOfReviews;

  await product.save();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  res.status(200).json({
    success: true,
    message: "review deleted successfully",
  });
});

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
