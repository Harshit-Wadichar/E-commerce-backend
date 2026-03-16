import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import type { newOrderRequestBody } from "../types/types.js";
import { invalidateCache, reduceStock } from "../utils/feature.js";
import ErrorHandler from "../utils/utility-class.js";

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

    if (
      !shippingInfo ||
      !orderItems ||
      !user ||
      !subtotal ||
      !tax ||
      !total
    )
      return next(new ErrorHandler("please enter all fields", 400));

    await Order.create({
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

    await invalidateCache({ product: true, order: true, admin: true });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
    });
  },
);
