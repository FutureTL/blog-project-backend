//imagine we have taken the avatar image from the user and 
//stored to our local storage. Now we will take it and upload to cloudinary.
import dotenv from "dotenv";
import {v2 as cloudinary } from "cloudinary";

dotenv.config({
    path: './env'
})

cloudinary.config({

  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET

});

//here in the cloudinary code we are passing localFilePath, and right now we
//have no idea where this comes from but we have to keep this in mind.
const uploadToCloudinary = async (localFilePath)=>{

try {

  if(!localFilePath){
    console.log("local path file not found!")
    return null;
  }
  
  //if I have imported {v2 as cloudinary then we have to write cloudinary only in place of cloudinary.v2}
  const response = await cloudinary.uploader
    .upload(localFilePath,{
    
      use_filename: true,
      resource_type: "auto"
    })
    console.log("file uploaded successfully to cloudinary: ", response);
    return response;

    
  } catch (error) {
    console.log("error in uploading on clodinary: ", error)
  }

}

export { uploadToCloudinary }

//here in this code I was confused that were the exact path of the file to
//be uploaded will come from. Well, light bulb moment! I can exact it from multer.
