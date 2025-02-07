import {create} from "zustand";
import {axiosInstance} from "../lib/axios.js";
import toast from "react-hot-toast";
import {io} from "socket.io-client";

const BASE_URL = import.meta.env.MODE ==="development"? "http://localhost:5001" : "/";

export const useAuthStore = create((set,get)=>({
    authUser : null,
    isSigningUp: false,
    isLoggingIn : false,
    isUpdatingProfile: false,
    onlineUsers : [],

    isCheckingAuth : true,
    socket : null,
    
    checkAuth: async()=>{
        try {
            const res = await axiosInstance.get("/auth/check");
            
            set({authUser:res.data});
            localStorage.setItem("authToken", res.data.token); // added 
            get().connectSocket();
        } catch (error) {
            console.log("Error in  CheckAuth || useAuthStore ..", error.message);
            set({authUser: null});   
            localStorage.removeItem("authToken"); // added 
        }
        finally{
            set({isCheckingAuth: false});
        }
    },

    signup : async(data)=>{
        set({isSigningUp : true});
    try {
        const res = await  axiosInstance.post("/auth/signup",data);
        set({authUser:res.data});
        localStorage.setItem("authToken", res.data.token); // added 
        toast.success("Account Created Successfully")
        get().connectSocket();
    } catch (error) {
    toast.error(error.response.data.message)
    localStorage.removeItem("authToken"); // added
    }
    finally{
        set({isSigningUp:false});
    }
    },

    login: async(data)=>{
       set({isLoggingIn : true});
       try {
        const res = await axiosInstance.post("/auth/login",data);
        set({authUser: res.data});
        localStorage.setItem("authToken", res.data.token); // added 
        toast.success("Logged in  Successfully");
        get().connectSocket();
       } catch (error) {
        toast.error(error.response.data.message);
        localStorage.removeItem("authToken"); // added
       }  finally
       {
        set({isLoggingIn : false});
       }
    },

    logout : async()=>{
        try {
            await axiosInstance.post("/auth/logout");
            set({authUser:null});
            localStorage.removeItem("authToken"); // added
            get().disconnectSocket();
            toast.success("Logged out Successfully")
        } catch (error) {
            toast.error(error.response.data.message);

        }
    },

    updateProfile: async(data)=>{
        set({isUpdatingProfile:true});
        try {
            const res = await  axiosInstance.put("/auth/update-profile",data);
            set({authUser : res.data});
            toast.success("Profile Updated Successfully");
        } catch (error) {
            console.log("Error in updating Profile", error);
            toast.error(error.response.data.message);
        }
        finally{
            set({isUpdatingProfile:false});
        }

    },
    connectSocket : ()=>{
        const {authUser} = get();
        if(!authUser || get().socket?.connected) return;
        const socket = io(BASE_URL,{
            query :{
                userId : authUser._id,
            }
        });
        socket.connect();
        set({socket : socket});

        socket.on("getOnlineUsers",(userIds)=>{
            set({onlineUsers: userIds});
        });
    },
    disconnectSocket : ()=>{
        if(get().socket?.connected)get().socket.disconnect();

    }
}));
