import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import productsRouter from './routes/productsRouter.js';
import userRouter from './routes/userRouter.js';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import orderRouter from './routes/orderRouter.js';
import cors from "cors";
import reviewRouter from './routes/reviewRouter.js';

dotenv.config()

const app = express();

const mongoUrl = process.env.MONGO_DB_URI
console.log('Loaded MONGO_URI:', process.env.MONGO_DB_URI);
mongoose.connect(mongoUrl,{})

const connection = mongoose.connection;
 
connection.once("open",()=>{
  console.log("Database connected");
})

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(bodyParser.json())

app.use(
  (req,res,next)=>{
    const token = req.header("Authorization")?.replace("Bearer ","")
    console.log(token)

    if(token != null){
      jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded)=>{
        if(!error){
          req.user = decoded
        }
      })
    }
    next()
  }
)

app.use("/api/products",productsRouter)
app.use("/api/users",userRouter)
app.use("/api/orders",orderRouter)
app.use("/api/reviews",reviewRouter)

app.listen(
  5000,
  ()=>{
    console.log('Server is running on port 5000');
  }
)
