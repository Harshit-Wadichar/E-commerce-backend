import express from 'express';
const port = 4000;

const app = express();

app.get('/',(req,res)=>{
    res.send("harshit wadichar")
})

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});