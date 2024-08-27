import { Router } from "express";
import { register, login, getCurrentUser } from "../controllers/user.controllers.js"
import { verifyJWT, verifyStrictJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router()

userRouter.route("/login").post(login)
userRouter.route("/register").post(register)
userRouter.route("/getCurrentUser").get(verifyStrictJWT, getCurrentUser);

export default userRouter