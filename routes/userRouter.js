import express from "express";
import { blockUser, delUser, getUser, getUserActivity, googleLogin, listUser, logoutUser, newUser, updateUser, userLogin} from "../controllers/userController.js";

//Create studentRouter
const userRouter = express.Router();

userRouter.post('/', newUser)

userRouter.post('/login', userLogin)

userRouter.post("/logout", logoutUser);

userRouter.get('/userdetail',getUser) 

userRouter.get('',listUser)

userRouter.delete('',delUser)

userRouter.post("/google", googleLogin)

userRouter.put("/", blockUser)

userRouter.put('/update/:email', updateUser)

userRouter.get("/activity", getUserActivity);

export default userRouter;