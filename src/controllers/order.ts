import type { Request } from "express";
import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import type { newOrderRequestBody } from "../types/types.js";
import { invalidateCache, reduceStock } from "../utils/feature.js";
import ErrorHandler from "../utils/utility-class.js";

export const myOrders = TryCatch(async (req, res, next) => {
  const { id: user } = req.query;

  let orders = [];

  if (myCache.has(`my-orders-${user}`))
    orders = JSON.parse(myCache.get(`my-orders-${user}`) as string);
  else {
    orders = await Order.find({ user: String(user) });
    myCache.set(`my-orders-${user}`, JSON.stringify(orders));
  }

  res.status(200).json({
    success: true,
    orders,
  });
});

export const allOrders = TryCatch(async (req, res, next) => {
  const key = `all-orders`;

  let orders = [];

  if (myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
  else {
    orders = await Order.find().populate("user", "name");
    myCache.set(key, JSON.stringify(orders));
  }

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getSingleOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const key = `order-${id}`;

  let order;

  if (myCache.has(key)) order = JSON.parse(myCache.get(key) as string);
  else {
    order = await Order.findById(id).populate("user", "name");

    if (!order) return next(new ErrorHandler("Order not found", 404));

    myCache.set(key, JSON.stringify(order));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

export const newOrder = TryCatch(
  async (req: Request<{}, {}, newOrderRequestBody>, res, next) => {
    const {
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    } = req.body;

    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total)
      return next(new ErrorHandler("please enter all fields", 400));

    const order =await Order.create({
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    });

    reduceStock(orderItems);

    invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId: order.orderItems.map(i=> String(i.productId)),
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
    });
  },
);

export const processOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);

  if (!order) return next(new ErrorHandler("order not found", 404));

  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;

    case "Shipped":
      order.status = "Delivered";
      break;

    default:
      order.status = "Delivered";
      break;
  }

  await order.save();

  invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
  });
});

export const deleteOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) return next(new ErrorHandler("order not found", 404));

  await order.deleteOne();

  invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  res.status(201).json({
    success: true,
    message: "Order deleted successfully",
  });
});
