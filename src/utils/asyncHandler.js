const asyncHandler = (requestHandler) => {
      return (req,res,next) => {
            Promise.resolve(requestHandler(req,res,next)).catch((error)=> next(error))
      }

}

export { asyncHandler }

//what I understand of this asyncHandler function till now-
    //it takes a function and simply wraps it so that if any 
    //error occurs that can be caught easily and passed to express
    //else the requestHandler function will be executed error free.