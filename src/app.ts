import express from 'express';

import { connect } from 'node:http2';
import { connectDb } from './utils/feature.js';
import { errorMiddleware } from './middlewares/error.js';
import Stripe from 'stripe';
import cors from "cors";

import {config} from "dotenv";
import NodeCache  from 'node-cache';
import morgan from "morgan";


//importing user routes
import userRoutes from './routes/user.js';
import productRoutes from './routes/products.js'
import orderRoutes from './routes/order.js'
import paymentRoutes from './routes/payment.js'
import dashboardRoutes from './routes/stats.js'
config({
  path:"./.env"
});

const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";

connectDb(mongoUri);

export const stripe = new Stripe(stripeKey);
export const myCache = new NodeCache()

// middlewares
const app = express();
app.use(express.json());
app.use(morgan("dev"))
app.use(cors());

//routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.get('/',(req,res)=>{
    res.send("ye route hai / yane ki home route")
})

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});