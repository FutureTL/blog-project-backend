import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()


//mostly with middlewares or configurations, we use app.use()
app.use(cors({
    origin: "http://localhost:5173",
    credentials:true
}))

app.use(express.json({
    limit:"16kb"
}))
//for receiving json data

app.use(express.urlencoded({
    limit:"20kb",
    extended:true
}))
//for receiving url data

app.use(express.static("public"))
//if there are any files they will get saved in this location.

app.use(cookieParser())  //use: so that we can access the cookies from the browser of the user.
                         //basically so that we can perform crud operations on the cookies of the user.


//we will import our routes here and using a middleware implement them:
import UserRoutes from "./route/user.route.js";

app.use("/api/v1/user", UserRoutes); //interacting with routes treating them as a 
                                      //middleware.


export { app };