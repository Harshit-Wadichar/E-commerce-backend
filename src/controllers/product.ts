import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import type { NewProductRequestBody } from "../types/types.js";

export const newProduct = TryCatch(
  async (
    req: Request<{}, {}, NewProductRequestBody>,
    res: ,
    next: ,
  ) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    await Product.create({
        name:name,
        price:price,
        stock:stock,
        category: category.toLowerCase(),
        photo: photo?.path,
    })

    res.status(201).json({
        success:true,
        message:"product created successfully"
    })

  }
);