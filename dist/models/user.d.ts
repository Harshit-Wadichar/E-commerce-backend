import mongoose from "mongoose";
interface IUser extends Document {
    id: string;
    name: string;
    email: string;
    photo: string;
    role: "admin" | "user";
    gender: "male" | "female";
    dob: Date;
    ucreatedAt: Date;
    updatedAt: Date;
    age: number;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any, IUser>;
export {};
//# sourceMappingURL=user.d.ts.map