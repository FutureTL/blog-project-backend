import mongoose from "mongoose";
import { User } from "./user.model.js";

const personBlogSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        required:true
    },
    // blogImage:{
    //     type:String
    // }

},{timestamps:true})

export const personalBlog = mongoose.model("personalBlog", personBlogSchema);