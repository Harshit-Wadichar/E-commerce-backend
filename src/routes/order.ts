import express from "express";
import { allOrders, deleteOrder, getSingleOrder, myOrders, newOrder, processOrder } from "../controllers/order.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

//  /api/v1/order/new - order creation route
app.post("/new", newOrder);

//  /api/v1/order/my - order creation route
app.get("/my", myOrders);

//  /api/v1/order/all - order creation route
app.get("/all",adminOnly, allOrders);

//  /api/v1/order/all - order creation route
app.route("/:id").get(getSingleOrder).put(adminOnly, processOrder).delete(adminOnly, deleteOrder);


export default app;