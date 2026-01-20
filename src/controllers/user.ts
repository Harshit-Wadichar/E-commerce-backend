import type { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import type { NewRequestUserBody } from "../types/types.js";

export const newUser = async (
  req: Request<{},{}, NewRequestUserBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { _id, name, email, photo, role, gender, dob } = req.body;

    const user = await User.create({
      _id,
      name,
      email,
      photo,
      role: role ?? "user",
      gender,
      dob
    });
    
    return res.status(201).json({
      success: true,
      message: `Welcome, ${user.name}`,
    });
  } catch (err) {}
};
