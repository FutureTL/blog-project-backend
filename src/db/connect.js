//this is my connection db file where I will connect
//to the mongodb database using mongoose.

//using ES6 imports

import mongoose from "mongoose";
import { Mongodb_name } from "../constants.js";


const mongodbConnect = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${Mongodb_name}`)
        console.log("connection established: ", connectionInstance.connection.host)
    } catch (error) {
        throw error;
        
    }
}


export {mongodbConnect};



//practice code direct driver code

// function greet(name, callback) {
//   console.log(`Hello, ${name}`);
//   callback();
// }

// greet("Alice", function() {
//   console.log("Callback executed");
// });
