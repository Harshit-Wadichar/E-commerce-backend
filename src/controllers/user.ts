import type { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import type { NewRequestUserBody } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middlewares/error.js";

export const newUser = TryCatch(
  async (
    req: Request<{}, {}, NewRequestUserBody>,
    res: Response,
    next: NextFunction,
  ) => {
    const { _id, name, email, photo, gender, dob } = req.body;
    console.log(req.body);
    console.log(_id, name, email, photo, gender, dob);

    const user = await User.findById(_id);

    if (user)
      return res.status(200).json({
        success: true,
        message: `Welcome, ${user.name}`,
      });
    if (!_id || !name || !email || !photo || !gender || !dob)
      return next(new ErrorHandler("please send all fields", 400));

    user = await User.create({
      _id,
      name,
      email,
      photo,
      gender,
      dob: new Date(dob),
    });

    return res.status(201).json({
      success: true,
      message: `Welcome, ${user.name}`,
    });
  },
);

export const getAllUsers = TryCatch(async (req, res, next) => {
  const users = await User.find({});

  return res.status(200).json({
    success: true,
    users,
  });
});

export const getUser = TryCatch(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findById(id);

  if (!user)
    return next(
      new ErrorHandler(
        "User not found for specific id, or wrong id passed",
        400,
      ),
    );

  return res.status(200).json({
    success: true,
    user,
  });
});


export const deleteUser = TryCatch(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findById(id);

  if (!user)
    return next(
      new ErrorHandler(
        "User not found for specific id, or wrong id passed",
        400,
      ),
    );

    await user.deleteOne();

  return res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
