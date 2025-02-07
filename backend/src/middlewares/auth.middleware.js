import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export async function protectRoute( req,res,next)
{
    try {
    const token = await req.cookies.jwt;

    if(!token) {return res.status(401).json({message : "Unauthorized - No token Provided"}); }

    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    if(!decoded) 
    {
        {return res.status(401).json({message : "Unauthorized - Invalid User"}); }
    }

    const user = await User.findById(decoded.userId).select("-password");

    req.user = user; 
    next();



    } catch (error) {
        console.log("Error in Verifying User || middleware",error.message);
        return res.status(500).json({message:"Internal Server Error"});
    }
}