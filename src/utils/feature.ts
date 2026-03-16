import mongoose from "mongoose"
import { myCache } from "../app.js"
import type { invalidateCacheProps, OrderItemType } from "../types/types.js"
import { Product } from "../models/product.js"

export const connectDb = async (uri:string) =>{
    try {
        await mongoose.connect(uri).then((c)=>{
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

export const reduceStock = async (orderItems: OrderItemType[]) =>{
    for(let i=0; i<orderItems.length; i++){
        const order = orderItems[i];
        const product = await Product.findById(order?.productId);
        if(product!){
            throw new Error("Product not found bro");
        }
        product.stock -= order?.quantity;
        await product.save();
    }

}