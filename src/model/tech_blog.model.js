import mongoose from "mongoose";
import { User } from "./user.model.js";

const techBlogSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

}, {timestamp:true})

export const techBlog = mongoose.model("techBlog", techBlogSchema);
