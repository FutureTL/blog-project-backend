//adding this file later when I understood the requirement for it:
//this is required when we want to authenticate the user- when would this be:
//when the app reloads, and we have no context(from frontend) on the user, then
//if the user have valid access and refresh tokens then they will be verified.

import jwt from "jsonwebtoken";
import {User} from "../model/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = asyncHandler( async(req, _ , next)=> {

    try {
        //maybe the user is opening the app, and we need to authenticate the user
        //we had issued access and refresh tokens to him/her and now they cab be
        //used for verification.

        //if the user is verfied , we will add a new object
        //called req.user along with req.body, 
    
        //next role: when the work of this middleware is over we will
        //pass on the control to the next thing.This next thing could be
        //another middleware or server.

        const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ", "")

        console.log(`the cookies passed by user in auth middleware: ${token}`);

        //problem here is if user doesn't exist he/she will not have any token.
        //then it should not throw this error.
        
        if(!token){
            // throw new ApiError(409, "unauthorized access.")
            //if there is no token, maybe the user is comuing to the app
            //for the 1St time so we should send null in response to current user.
            req.user = null
            return next();
        }

        //uptil now we checked if token existed or not. Now we have to 
        //verify it.
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        //for verifying we need the token and the secret key.
        console.log(`decodedToken : ${decodedToken}`);
        

        const user  = await User.findById(decodedToken.id);

        if(!user){
            throw new ApiError(401, "invalid access token")
        }
        //else we now have the user, and we sent it to the next step
        req.user = user;
        next(); //this next goes to whatever is after this middleware

    } catch (error) {
        throw new ApiError(401, error?.message || "something went wrong in authenticating the user tokens")
    }
})