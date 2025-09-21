import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



const userSchema = new mongoose.Schema({

        username:{
            type:String,
            required:true,
            unique:true
        },
        fullname:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            
        },
        description:{
            type:String
        },

        personalBlog:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "personalBlog"
            }
        ],

        techBlog:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:"techBlog"
            }
        ],

        avatar:{
            type:String,  //use the cloudinary url
            required:true 
        },
        accessToken:{
            type: String,
            // required:true
        },
        refreshToken:{
            type: String,
            
        }



}, { timestamps:true })

//here we will verify the user's password against the one we have
//stored in our database.
//I am assuming that I have stored a hashed password in the database,
//and now the password obtained from the user is hashed and compared against the one stored 
//in the database. VOILA~





//I am leaving this code here to refer later and see the mistake I have made
//arrow function doesn't have a scope, and this keyword cannot be used inside it and
//I was making the mistake of using it.
// userSchema.methods.verifyPassword = async (password) => {
//     const comparePassword = await bcrypt.compare(password, this.password)
//     console.log(`${password} VS ${this.password}`)
//     return comparePassword;
// }

//the correct code is below:
userSchema.methods.verifyPassword = async function(password) {
    console.log("password of user saved in database: ", this.password)
    const comparePassword = await bcrypt.compare(password, this.password)
    console.log(`${password} VS ${this.password}`)
    return comparePassword;
}

// userSchema.methods.generatePasswordHash = function(password){
    

//     const salt =10;
//     bcrypt
//     .hash(password, salt)
//     .then((hash)=>{
//         console.log("hash generated for the password: ", hash);
//     })
//     .catch((err)=>{
//         console.log("error while generating hash of password: ", err)
//     })
    
// }

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        { //payload
            id: this._id,
            email: this.email,
            username: this.username
        },
        //secret
        process.env.ACCESS_TOKEN_SECRET,
        //additional options
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {//payload
            id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model("User", userSchema);