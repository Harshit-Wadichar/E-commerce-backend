import { User } from "../models/user.js";
export const newUser = async (req, res, next) => {
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
    }
    catch (err) {
        return res.status(201).json({
            success: false,
            message: `lol, error happened bro${err}`,
        });
    }
};
//# sourceMappingURL=user.js.map