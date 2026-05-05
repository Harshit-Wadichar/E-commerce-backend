import express from "express";


import { connectDb, connectRedis } from "./utils/feature.js";
import { errorMiddleware } from "./middlewares/error.js";
import Stripe from "stripe";
import cors from "cors";

import { config } from "dotenv";
import morgan from "morgan";

import { v2 as cloudinary } from "cloudinary";

//importing user routes
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";
import dashboardRoutes from "./routes/stats.js";
config({
  path: "./.env",
});

const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";
const redisURI = process.env.REDIS_URI || "";
export const redisTTL = process.env.REDIS_TTL || 60 * 60 * 4; 


const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;

if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_API_SECRET) {
  throw new Error("Missing Cloudinary environment variables");
}

connectDb(mongoUri);
export const redis = connectRedis(redisURI);

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET,
});

export const stripe = new Stripe(stripeKey);

// middlewares
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({
  origin: [process.env.CLIENT_URL!],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

//routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("ye route hai / yane ki home route");
});

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
