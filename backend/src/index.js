import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js"
import dotenv from "dotenv";
import { dbConnect } from "./lib/dbConnect.js";
import cookieParser from "cookie-parser"; 
import cors from "cors";
import {server,app} from "./lib/socket.js";
import path from "path";

dotenv.config()


const PORT = process.env.PORT;
const __dirname = 


app.use(express.json({limit:"50mb"})); // this will  allow the  req.body  to  get the data  in json fromat 
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
   // methods: "GET,POST,PUT,DELETE",
    credentials: true,
}))



app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);

if(process.env.NODE_ENV === "production")
{
 app.use(express.static(path.join(__dirname,"../frontend/chatapp/dist"))); 
 
 app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"../frontend/chatapp","dist","index.html"));
 });
}

server.listen(PORT, ()=>{
    console.log(`Server Up and Running on port ${PORT}`);
    dbConnect();
})
