import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { Redis } from "ioredis";
import mongoose from "mongoose";
import { redis } from "../app.js";
import { Product } from "../models/product.js";
import { Review } from "../models/review.js";
import type { invalidateCacheProps, OrderItemType } from "../types/types.js";

export const findAverageRatings = async (
  productId: mongoose.Types.ObjectId,
) => {
  let totalRating = 0;

  const reviews = await Review.find({ product: productId });
  reviews.forEach((review) => {
    totalRating += review.rating;
  });

  const averageRating = Math.floor(totalRating / reviews.length) || 0;

  return {
    ratings: averageRating,
    numOfReviews: reviews.length,
  };
};

const getBase64 = (file: Express.Multer.File) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

export const uploadToCloudinary = async (files: Express.Multer.File[]) => {
  const promises = files.map(async (file) => {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload(getBase64(file), (error, result) => {
        if (error) return reject(error);
        resolve(result!);
      });
    });
  });
  const result = await Promise.all(promises);

  return result.map((i) => ({
    public_id: i.public_id,
    url: i.secure_url,
  }));
};

export const deleteFromCloudinary = async (publicId: string[]) => {
  const promises = publicId.map((id) => {
    return new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(id, (error, result) => {
        if (error) return console.log(error);
        resolve();
      });
    });
  });

  await Promise.all(promises);
};

export const connectRedis = (redisURI: string) => {
  const redis = new Redis(redisURI);
  redis.on("connect", () => {
    console.log("Redis connected");
  });
  redis.on("error", (err) => {
    console.log(err);
  });
  return redis;
};

export const connectDb = async (uri: string) => {
  try {
    await mongoose.connect(uri).then((c) => {
      console.log(`DB connected to ${c.connection.host}`);
    });
  } catch (error) {
    console.log("Database connection failed");
    console.log(error);
  }
};

export const invalidateCache = async ({
  product,
  order,
  admin,
  review,
  userId,
  orderId,
  productId,
}: invalidateCacheProps) => {
  if(review){
    await redis.del([`reviews-${productId}`])
  }
  if (product) {
    const productKeys: string[] = [
      "latest-product",
      "categories",
      "all-products",
      "admin-products",
    ];

    if (typeof productId === "string") productKeys.push(`product-${productId}`);

    if (typeof productId === "object" && productId !== null) {
      productId.forEach((id) => productKeys.push(`product-${id}`));
    }

    await redis.del(productKeys);
  }
  if (order) {
    const ordersKeys: string[] = [
      "all-orders",
      `my-orders-${userId}`,
      `order-${orderId}`,
    ];

     await redis.del(ordersKeys);
  }
  if (admin) {
    await redis.del([
      "dashboard-stats",
      "admin-pie-charts",
      "admin-bar-charts",
      "admin-line-charts",
    ]);
  }
};

export const reduceStock = async (orderItems: OrderItemType[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    if (!order) continue;
    const product = await Product.findById(order.productId);
    if (!product) {
      throw new Error("Product not found bro");
    }
    product.stock -= order.quantity;
    await product.save();
  }
};

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) return thisMonth * 100;
  const percent = (thisMonth / lastMonth) * 100;
  return Number(percent.toFixed(0));
};

export const getInventories = async ({
  categories,
  productCount,
}: {
  categories: string[];
  productCount: number;
}) => {
  const categoriesCountPromise = categories.map((category) =>
    Product.countDocuments({ category }),
  );

  const categoriesCount = await Promise.all(categoriesCountPromise);

  const categoryCount: Record<string, number>[] = [];

  categories.forEach((category, i) => {
    categoryCount.push({
      [category]:
        productCount === 0
          ? 0
          : Math.round((categoriesCount[i]! / productCount) * 100),
    });
  });

  return categoryCount;
};

interface MyDocument {
  createdAt: Date;
  discount?: number;
  total?: number;
}

type funcProps = {
  length: number;
  docArr: MyDocument[];
  today: Date;
  property?: "discount" | "total";
};

export const getChartData = ({
  length,
  docArr,
  today,
  property,
}: funcProps) => {
  const data: number[] = new Array(length).fill(0);

  docArr.forEach((i) => {
    const creationDate = i.createdAt;
    const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

    if (property) {
      data[length - monthDiff - 1]! += i[property]!;
    } else {
      data[length - monthDiff - 1]! += 1;
    }
  });

  return data;
};
