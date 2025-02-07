import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";



export  const signup = async(req,res)=>{

    //console.log(req.body);
const {fullName, email,password} = req.body;
    try {
        if(!fullName || !email || !password)
        {
            return res.status(400).json("All fields required for  signup");
        }
        if(password.length < 6)
        {
            return res.status(400).json( "Password should be greater than 6 characters");
        }
        

        const user = await User.findOne({email});
        if(user) return res.status(400).json({message:"Email already  exists"});

        const salt  = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName,
            email,
            password : hashedPassword,
        });
     if(newUser) 
     {
        //generate jwt token 
        generateToken(newUser._id,res)
            await newUser.save();

            res.status(201).json(
                {
                    _id : newUser._id,
                    fullName : newUser.fullName,
                    email:newUser.email,
                    profilePic : newUser.profilePic,
                }
       );
    } else 
     res.status(400).json("Invalid user data");

    } catch (error) {
        console.log("Error in signup controller",error.message)
        return res.status(500).json({
            message : "Internal Server Error || auth.controller.js"
        }
)}
};

export const login =  async(req,res)=>{
    //console.log(req.body)
   const {email,password} = req.body;
   try {
   const user =  await User.findOne({email});

   if(!user) return res.status(404).json({message: "Invalid Credentials || user not found"});

 const isPasswordCorrect = await bcrypt.compare(password,user.password); // this will give a boolean value

 if(!isPasswordCorrect) {return res.status(404).json({message: "Invalid Credentials || password"});}

 generateToken(user._id,res);
 return res.status(200).json(
    {
        _id : user._id,
        fullName : user.fullName,
        email : user.email,
        profilePic : user.profilePic,
    }
 );

   } catch (error) {
    console.log("Error in Login || auth controller...",error.message);
    return res.status(500).json({message:"Internal Server Error"})
   }
};

export const logout =  (req,res)=>{
   try {
        res.cookie("jwt", "",{maxAge : 0});
        return res.status(200).json("Logged Out Successfully")
   } catch (error) {
    console.log( "Error in logging out ", error.messge);
    return res.json(500).json("Internal Server Error");
   }
};

export const updateProfile  = async(req,res)=>{
        try {
            const {profilePic} = req.body;
            const userId = req.user._id;

            if(!profilePic) return res.status(400).json({message : "Profile Picture required"});

            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            const updatedUser = await User.findByIdAndUpdate(userId,
                {profilePic:uploadResponse.secure_url},
                {new:true}
            );

            return res.status(200).json(updatedUser);
        } catch (error) {
            console.log("Internal  server Error || updateProfilePic",error);
            return res.status(500).json({message : "Internal  server Error || updateProfilePic"});
        }

}

export const checkAuth = async(req,res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checking ",error.message)
        res.status(500).json({message:"Internal Server Error || checkAuth."});
    }
}