import express from 'express';

//importing user routes
import userRoutes from './routes/user.js';

const port = 4000;

const app = express();

//routes
app.use("/api/v1/user", userRoutes);

app.get('/',(req,res)=>{
    res.send("harshit wadichar")
})

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});