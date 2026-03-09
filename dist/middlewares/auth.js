import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { User } from "../models/user.js";
//middleware to make sure only admin is allowed
export const adminOnly = TryCatch(async (req, res, next) => {
    const { id } = req.query;
    if (!id)
        return next(new ErrorHandler("please send user id in query", 401));
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("User not exists", 401));
    if (user.role !== "admin")
        return next(new ErrorHandler("Your not admin to access this routes", 401));
    next();
});
//# sourceMappingURL=auth.js.map