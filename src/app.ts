import express from 'express';


import { connect } from 'node:http2';
import { connectDb } from './utils/feature.js';
import { errorMiddleware } from './middlewares/error.js';

//importing user routes
import userRoutes from './routes/user.js';
import productRoutes from './routes/products.js'


const port = 4000;

connectDb();

// middlewares
const app = express();
app.use(express.json());


//routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);

app.get('/',(req,res)=>{
    res.send("ye route hai / yane ki home route")
})

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});