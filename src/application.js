import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const application = express()


//mostly with middlewares or configurations, we use application.use()
application.use(cors({
     origin: ["http://localhost:5173", "https://papaya-dusk-73e90e.netlify.app"],
    credentials: true
}))

application.use(express.json({
    limit:"16kb"
}))
//for receiving json data

application.use(express.urlencoded({
    limit:"20kb",
    extended:true
}))
//for receiving url data

application.use(express.static("public"))
//if there are any files they will get saved in this location.

application.use(cookieParser())  //use: so that we can access the cookies from the browser of the user.
                         //basically so that we can perform crud operations on the cookies of the user.


//we will import our routes here and using a middleware implement them:
import UserRoutes from "./route/user.route.js";

application.use("/api/v1/user", UserRoutes); //interacting with routes treating them as a 
                                      //middleware.


export { application };