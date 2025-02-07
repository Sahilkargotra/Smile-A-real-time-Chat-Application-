import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export function generateToken(userId,res)
{
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{
        expiresIn:"7d",
    });
    res.cookie("jwt",token,{
        maxAge : 7*24*60*60*1000, // expiry in milliseconds
        httpOnly : true, // prevent XSS attacks 
        sameSite: "strict", // prevents CSRF cross site request forgery  attacks
        secure : process.env.NODE_ENV  !== "development", // this  ensures  when we  are in deployment https is enabled
    })

    return token;
}