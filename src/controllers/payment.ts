import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";

export const createPaymentIntent = TryCatch(async (req, res, next) => {
  const { amount } = req.body || {};

  if (!amount) {
    return next(new ErrorHandler("amount is required bro", 400));
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) * 100,
    currency: "inr",
  });

  res.status(201).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  });
});

export const newCoupon = TryCatch(async (req, res, next) => {
  const { code, amount } = req.body || {};

  if (!code || !amount) {
    return next(
      new ErrorHandler("coupon code and amount both are required bro", 400),
    );
  }
  await Coupon.create({
    code,
    amount,
  });
  res.status(201).json({
    success: true,
    message: `coupon ${code} created successfully`,
  });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query || {};

  const discount = await Coupon.findOne({ code: String(coupon) });

  if (!discount) {
    return next(new ErrorHandler("discount not found", 400));
  }

  res.status(201).json({
    success: true,
    discount: discount.amount,
  });
});

export const allCoupons = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.find({});

  res.status(201).json({
    success: true,
    coupons,
  });
});

export const updateCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params || {};

  const {code, amount} = req.body || {};

  const coupon = await Coupon.findById(id);

  if (!coupon) {
    return next(new ErrorHandler("coupon with this ID not found", 400));
  }

  if(code) coupon.code = code;

  if(amount) coupon.amount = amount;

  await coupon.save();

  res.status(201).json({
    success: true,
    message: `Coupon ${coupon.code} updated successfully`,
  });
});

export const getCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params || {};

  const coupon = await Coupon.findById(id);

  if (!coupon) {
    return next(new ErrorHandler("coupon with this ID not found", 400));
  }

  res.status(201).json({
    success: true,
    coupon,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params || {};

  const deletedCoupon = await Coupon.findByIdAndDelete(id);

  if (!deletedCoupon) {
    return next(new ErrorHandler("coupon with this ID not found", 400));
  }

  res.status(201).json({
    success: true,
    message: "Coupon deleted successfully",
  });
});
