import dotenv from "dotenv"
import { mongodbConnect } from "./db/connect.js" 
import { application } from  "./application.js";



import { personalBlog } from "./model/personal_blog.model.js";
import mongoose from "mongoose";
import { User } from "./model/user.model.js";
import { ApiError } from "./utils/ApiError.js";


dotenv.config({
    path: './env'
})

const CurrentPort = process.env.PORT || 8000


mongodbConnect()
.then(()=>{
    const server = application.listen(CurrentPort,()=>{
        console.log("application running on port: ", CurrentPort)
    })

    server.on("error", (error)=>{
        console.log("problem in connecting to the server: ", error)
    })

})
.catch((error)=>{
    console.log("database connection has failed: ", error)
})


