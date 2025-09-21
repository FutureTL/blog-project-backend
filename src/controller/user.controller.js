import { User } from "../model/user.model.js";
import { personalBlog } from "../model/personal_blog.model.js";
import { techBlog } from "../model/tech_blog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";
import { log } from "console";



//generating hash for the password:
const generatePasswordHash = async function(password){
    
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log("here is hash value: ", hash)
    return hash;
   
}

//logic for user registration:
const registerUser = asyncHandler(async(req, res, next)=>{

   const {username, fullname, password, confirmPassword, email,description} = req.body;
   //using req.body we can get only the text values not files(images, videos, pdf)
    
   if(password != confirmPassword){
    throw new ApiError(400, "password should be equal to confirmed password!");
   }

   if(!username || !email || !password || !fullname){
    throw new ApiError(409, "all necessary details must be filled out.");
   }

   //we will check one that the user trying to register is not already registered.
   if(email == User.findOne(email) ){
    throw new ApiError(409, "Email already exists!")
   }

   if(username == User.findOne(username)){
    throw new ApiError(409, "Username already exists!")
   }

   //here I can also employ some checks for email, will do that later on.

   //right now, since user is valid, we have to put info in database.

   //also password in hashed form will be stored in the database
   const hashPassword = await generatePasswordHash(password);
   console.log("this is the hashed password: ",hashPassword);

   //avatar is taken from user -> upload to local storage using multer ->
   //upload to cloudinary -> link is taken from cloudinary to store in local database.
   
    //  upload.single('avatar') why we didn't write this line.
    const avatarLocalPath = req.files?.avatar[0]?.path //how are able to use the name avatar without any error being thrown
    console.log("req.files: ", req.files);
    console.log("here is the path for avatar file: ", avatarLocalPath)
    if(!avatarLocalPath){
      throw new ApiError(409, "Avatar image required!")
    }
    const avatar = await uploadToCloudinary(avatarLocalPath);
    console.log("avatar details: ", avatar)

    if(!avatar){
      throw new ApiError(400, "Image could not be uploaded on cloudinary!")
    }
    
    
    
    const user = await User.create({
            username: username.toLowerCase(),
            fullname,
            email,
            password:hashPassword,
            description,
            avatar: avatar.url,
            
        })
        console.log("user detail: ", user);
        //here in select we put the fields we want to remove from the reponse of user.
        const userCreated = await User.findById(user._id).select("-refreshToken");
        if(!userCreated){
            throw new ApiError(500, "something went wrong in registering the user!");
        }

        console.log("user created", userCreated);

        //here we need to send the username/email, and password in the response because in our frontend logic, 
        //when the user signups, then he/she gets automatically logged in, and for
        //logging in the user, we require email/username, and password.
        return res.status(201).json(
              new ApiResponse(200, userCreated, "user registered successfully")
        );
})
 
const loginUser = asyncHandler( async(req, res, next) => {

  //when user logins in, I want to provide her/him, with both the access and refresh tokens
  //when access token expires, the refresh token must be used to refresh the access token, but
  //this process should be rotation based, that means when access token is refreshed the fresh token
  //must also get refreshed-> why? -> to ensure less vulnerability of a longer exposed refresh token.

  //login: user will login with email or username as both are kept unique in this application, along with password.
  //access token and refresh token will be generated for the user. 
  //Both these will be stored in the database of the user, only the refresh token will be given to the user.
  //when the access token of the user expires, the refresh token value will be compared to generate new refresh and access token(rotation based).

  const {email, username, password} = req.body;
  if(!(email || username)){
    throw new ApiError(409, "Email or username required for login!");
  }
  if(!password){
    throw new ApiError(409, "passwords is required!")
  }

  const user = await User.findOne({
    $or:[{email},{username}]
  })
  console.log("user detail with given email or username: ", user);

  if(!user){
    throw new ApiError(409, "username or email not found!");
  }
  //now my logic is that user exists, so I will take his email or username and find the id 
  //of this user. once we have that now we can compare the password of the user.
  
  
  const verifiedPassword = await user.verifyPassword(password);
  console.log("output for verified pass: ", verifiedPassword)

  if(!verifiedPassword){
    throw new ApiError(409, "incorrect password");
  }
  //if we have reached here then user is verified, his email/username and password have matched.

  //now our objective:
  //Step 1: generate access and refresh token for this user 
  //STEP 2:store the generated ones in the databse of the user
  //STEP 3:return the refresh token to the user.

  //Step 1:
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  //step 2:
  user.accessToken = accessToken;
  user.refreshToken = refreshToken;

  const result = await user.save();
  if(!result){
    throw new ApiError(400, "Failed to save tokens to the database!");
  }

  console.log("if tokens are saved to database, here is the response: ", result);
  
  console.log("Response object: ", new ApiResponse(200, refreshToken, "Sending refresh token to the user"));

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  //--------------------new addition of options to secure cookies----------//
  //creating an object that ensures that the cookies can be modified by server-side 
  //only and not the frontend.
  const options= {
    httpOnly: true,
    secure: false
  }


  //remember- cookies should not have space in their names - "accessToken" not "access token"
  return res
  .status(200)
  .cookie("accessToken",accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(200,
      {
        user: loggedInUser 
      }
      , "user logged in succesfully")
  )
  

})
//now I have completed the routes- register and login
//now our focus will be blog routes- tech and personal.

const getCurrentUser = asyncHandler(async(req, res, next) => {

  console.log(`the data coming from auth middleware:: ${req.user}`);
  
//here if user is authenticated by the auth middleware, we will land here
//and then we are sending these user details to the frontend.
    res.status(200)
    .json(
      new ApiResponse(201, 
        {
          user: req.user
        },
        "here are current user details"
      )
    )

})

const getPersonalBlogs = asyncHandler(async(req, res, next)=>{
    //here a user will be able to see all the personal blogs published 
    //latest appearing first.

    //logic: we will get all the personal blogs published- latest first:
  const allPersonalBlogs =  await personalBlog.find({}).sort({"createdAt":-1}).populate("author", "-password -refreshToken");

  //we are using populate here that will populate the author details instead of just showing its id.
  
  console.log("returning the response to the user: ", new ApiResponse(200, allPersonalBlogs, "see api resonse to the user"));

  return res
  .status(201)
  .json(new ApiResponse(
    200,
   
      allPersonalBlogs,
  
    "All personal blogs shared with user!"
  ))

})

const getTechBlogs = asyncHandler(async(req, res, next)=>{
    //here a user will be able to see all the personal blogs published 
    //latest appearing first.

    //logic: we will get all the personal blogs published- latest first:
  const alltechBlogs =  await techBlog.find({}).sort({"createdAt":-1})
  
  console.log("returning the response to the user: ", new ApiResponse(200, alltechBlogs, "see api resonse to the user"));

  return res
  .status(201)
  .json(new ApiResponse(
    200,
    alltechBlogs,
    "All tech blogs shared with user!"
  ))

})

const getAllwriters = asyncHandler( async(req, res,next)=>{

  //here the list of all the writers will be displayed. 
  //guide for the frontend engineer- the information will be displayed in
  //in the form of playcards each showing the following details of the user:
    // 1. fullname
    // 2. username
    // 3. description
    // 4. tech-blogs of the user
    // 5. personal- blogs of the user

    //as it is a get request we have to send and display data to the user.
    //------------------------All user are not writers but we are fetching all users----------
    const allWriters = await User.find({ personalBlog: { $exists: true, $not: { $size: 0 } } }).sort({fullname:1}).select("-password -refreshToken -accessToken -createdAt -updatedAt");

    console.log(`users fetched from database : ${allWriters}`);
   
    

    return res
    .status(200)
    .json(
      new ApiResponse(200, allWriters, "Here is the list of all the users")
    )

})

const getParticularWriterDetails = asyncHandler( async(req, res, next)=>{

  //from the list of all the writers displayed, the user clicks on the profile
  //of a particular writer and is directed to the url- /our-writers/username-of-the-author
  //then we have to fetch and display the details of that particular writer.

  //now here, we need the information from the frontend that which writer was
  //clicked by the user,then only we can display his/her details.
  
  //as we have created the route using the username of the writer, that value, 
  //can be fetched using req.params

  const username = req.params.username;
  const user = await User.findOne({username: username}).select("-password -accessToken -refreshToken -id");

  console.log("writer details: ", user.fullname)
  return res
  .status(201)
  .json(
    new ApiResponse(200, user, `here are the details of ${user.fullname} having username: ${user. username}`)
  )



})

const publishBlogs = asyncHandler( async(req, res, next)=>{

  const username = req.params.username;
  console.log(`username fetched from the url: ${username}`);
  
  const {title, content} = req.body;

  if(!title){
    throw new ApiError(409, "title is required for publishing the blog!")
  }

  if(!content){
    throw new ApiError(409, "content is required for publishing the blog!")
  }

  const user = await User.findOne({username: username});

      console.log(`the details of the user who wants to publish: ${user}`);

      //Imagine: the writer has written a blog and he/she wants to publish it.
      //this info will be conveyed by the frontend code to the backend.
      
      const newBlog = await personalBlog.create({
            title: title,
            content : content,
            author : user._id //before I was getting an error for - cast to objectId failed for value because 
            //I was passing user instead of user._id
      })

      console.log(`the new blog entry in personalBlogs id : ${newBlog}`)

      if(!newBlog){
        throw new ApiError(404, "there was an issue in adding new blog to personalBlog database")
      }

      //new blog added in personal blogs, 
      //qs- do I also need to add the blog in the user database, that I cannot recall.
      // yes both need to be updated.

    const response = await User.findByIdAndUpdate(user._id, {
          $push: { 
            personalBlog: newBlog._id 
          }
      });
    console.log(`blog added in user database : ${response}`)
    if(!response){
      throw new ApiError(404, "blog could not be added in user database");
    }

    return res.status(200)
    .json(
      new ApiResponse(201, newBlog, "new blog is created and added in user database")
    )


})

//displaying an article. -> get an article from the database .
const displayBlog = asyncHandler(async(req, res, next)=>{

    //frontend has blog information. - id, author_id, title, content
    const {author,title, id} = req.params;

    if(!id){
      throw new ApiError(404, "id from url not fetched")
    }
    console.log(`displayBlog ::id :: ${id}`);

    const blog = await personalBlog.findById(id);
    if(!blog){
      throw new ApiError(404, "blog with given id could not be fetched.")
    }

    console.log(`the blog with given id: ${blog}`);


    const user = await User.findById(blog.author._id);
    if(!user){
      throw new ApiError(404, "user with author id not found");
    }

    console.log(`user whose blog is to be displayed: ${user}`);

    return res
    .status(200)
    .json(
      new ApiResponse(201,
        { 
          blog,
          user

        }, "blog to be displayed is fetched successfully!")
    )

})


export {
  registerUser,
  loginUser,
  getCurrentUser,
  getPersonalBlogs,
  getTechBlogs,
  getAllwriters,
  getParticularWriterDetails,
  publishBlogs,
  displayBlog
}