import { User } from "../models/user.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middlewares/error.js";
export const newUser = TryCatch(async (req, res, next) => {
    const { _id, name, email, photo, gender, dob } = req.body;
    console.log(req.body);
    console.log(_id, name, email, photo, gender, dob);
    const user = await User.findById(_id);
    if (user) {
        return res.status(200).json({
            success: true,
            message: `Welcome, ${user.name}`
        });
    }
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
});
//# sourceMappingURL=user.js.map