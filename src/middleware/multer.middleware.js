import multer from "multer";
//here we write code for multer which is a middleware in nodejs.

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, "./public/temp")
    },
    filename: (req, file, cb)=>{
        cb(null, file.originalname)
    }
})
//here we have specified the location where the files will be stored temporarily.
//and the name of the file that will be saved in our local storage.

const upload = multer({
    storage
})

export { upload }

