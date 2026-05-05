import multer from "multer";
import {v4 as uuid} from "uuid";

export const singleUpload = multer().single("photo")
export const multiUpload = multer().fields([
  { name: "photo", maxCount: 10 },
  { name: "photos", maxCount: 10 },
]);
