import mongoose from "mongoose"
import { myCache } from "../app.js"
import type { invalidateCacheProps } from "../types/types.js"
import { Product } from "../models/product.js"

export const connectDb = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce26").then((c)=>{
            console.log(`DB connected to ${c.connection.host}`)
        })
    } catch (error) {
        console.log("Database connection failed")
        console.log(error)
    }
}

export const invalidateCache = async ({product, order, admin}: invalidateCacheProps) =>{
   if(product){
    const productKeys: string[] = ["latest-product", "categories", "all-products"];

    const product = await Product.find({}).select("_id");

    product.forEach((i)=>{
        productKeys.push(`product-${i._id}`);
    });

    myCache.del(productKeys);
   }
   if(order){

   }
   if(admin){

   }
}