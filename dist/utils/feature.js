import mongoose from "mongoose";
export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce26").then((c) => {
            console.log(`DB connected to ${c.connection.host}`);
        });
    }
    catch (error) {
        console.log("Database connection failed");
        console.log(error);
    }
};
//# sourceMappingURL=feature.js.map