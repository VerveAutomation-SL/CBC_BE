import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    email : {
      type : String,
      required : true,
      unique : true
    },
    firstName : {
      type : String,
      required : true
    },
    lastName : {
      type : String,
      required : true
    },
    password : {
      type : String,
      required : true
    },
    isBlocked : {
      type : Boolean,
      default : false
    },
    type : {
      type : String,
      default : "customer"
    },
    profilePicture : {
      type : String,
      default : "https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg"
    },
  })

  const User = mongoose.model("users",userSchema)

  export default User