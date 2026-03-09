import multer from "multer";
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "uploads");
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
export const singleUpload = multer({ storage: storage }).single("photo");
//# sourceMappingURL=multer.js.map