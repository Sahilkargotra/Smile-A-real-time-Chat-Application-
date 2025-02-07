import User from "../models/user.model.js"
import Message from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js";
import { getRecieverSocketId,io } from "../lib/socket.js";
export const getUsersForSidebar = async(req,res)=>{
 try {
    const LoggedInUser = req.user._id;
    const filteredUser = await User.find({ _id: {$ne : LoggedInUser  }}).select("-password");
    

    res.status(200).json(filteredUser);
 } catch (error) {
    console.log("Error in getUsersForSidebar", error.message);
    res.status(500).json({error: " Internal Server Error || getUsersForSidebar. "});
 }
};
export const getMessages = async(req,res)=>{
    try {
        const {id:userToChatId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
             $or:[
            {senderId : userToChatId,recieverId:myId},
            {senderId : myId,recieverId:userToChatId}
        ]})
        //console.log("messages in message.controller.js",messages);
        return res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getting messges || getMessage.." , error.message);
        res.status(500).json({error: " Internal Server Error || getMessage.."});
    }
}
export const sendMessage = async(req,res)=>{
    try {
        const {text,image} = req.body;
        const {id :recieverId} = req.params;
        const senderId = req.user._id;
        let imageUrl;
        if(image)
        {
            const uploadResult = await cloudinary.uploader.upload(image);
            imageUrl = uploadResult.secure_url;
        }
        
        const newMessage = new Message({
            senderId,
            recieverId,
            text,
            image : imageUrl,
        });
    
        await newMessage.save();

        const recieverSocketId = getRecieverSocketId(recieverId);
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage",newMessage);
        }

    
        return res.status(201).json(newMessage);
    } catch (error) {
        console.log("Internal Server Error || sendMessages..",error.message);
        res.status(500).json({error: " Internal Server Error || sendMessages.."});
    }
   
}