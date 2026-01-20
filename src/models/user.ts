import mongoose from "mongoose";
import validator from "validator";

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

const schema = new mongoose.Schema({

    id: {
        type: String,
        requried: [true, "Please enter ID"],
    },
     name: {
        type: String,
        requried: [true, "Please enter name"],
    },
     email: {
        type: String,
        unique: [true, "Email already exists"],
        requried: [true, "Please enter name"],
        validate: validator.default.isEmail,
    },
    photo: {
        type: String,
        requried: [true, "Please add photo"],
    },
    role:{
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    gender:{
        type: String,
        enum: ["male", "female"],
        required: [true, "please enter your gender"],
    },
    dob:{
        type: Date,
        required: [true, "please enter your date of birth"],
       
    },

},{
    timestamps: true,
})

schema.virtual("age").get(function () {
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();

    if(
        today.getMonth() < dob.getMonth() ||
        (today.getMonth()=== dob.getMonth() && today.getDate() < dob.getDate())
    )
    {age--;}

    return age;
})

export const User = mongoose.model<IUser>("User", schema);
