import mongoose from "mongoose";

const schema = new mongoose.Schema({
 code:{
    type: String,
    required: [true, "coupon code is required bro"],
    unique: true,
 },
 amount:{
    type:Number,
    required:[true,"amount is required bro"]
 },
 
})

export const Coupon = mongoose.model("Coupon", schema)