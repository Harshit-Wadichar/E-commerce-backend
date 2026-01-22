import type { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import type { NewRequestUserBody } from "../types/types.js";

export const newUser = async (
  req: Request<{},{}, NewRequestUserBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { _id, name, email, photo, gender, dob } = req.body;
    console.log(req.body);
    console.log(_id, name, email, photo, gender, dob);
    

    const user = await User.create({
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
  } catch (err) {
    return res.status(201).json({
      success: false,
      message: `lol, error happened bro${err}`,
    });
  }
};
