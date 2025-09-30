import {loginUser, registerUser, getPersonalBlogs, getTechBlogs, getParticularWriterDetails, getAllwriters, publishBlogs, displayBlog, getCurrentUser, ImageUploadToCloudinary} from "../controller/user.controller.js";
import express from "express"
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/register").post( //router

    upload.fields([{ name: 'avatar', maxCount: 1 }]), //middleware

    registerUser //controller

)
router.route("/login").post(loginUser)

router.route("/currentUser").get(

    verifyJWT,  //authentication middleware
    getCurrentUser //controller that runs if user is authenticated first.
                   //these details of the user can then be used for filing the context.

)

router.route("/personal-blogs").get(getPersonalBlogs)

router.route("/tech-blogs").get(getTechBlogs);

router.route("/our-writers").get(getAllwriters);

router.route("/our-writers/:username").get(getParticularWriterDetails);

router.route("/:username/new-blog").post(
    
    publishBlogs)

router.route("/:author/:title/:id").get(displayBlog)

router.route("/uploadImage").post(
    
    upload.fields([{ name: 'file', maxCount: 1 }]),
    
    ImageUploadToCloudinary)


export default router;