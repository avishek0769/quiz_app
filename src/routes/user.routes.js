import { Router } from "express";
import { register, login, getCurrentUser, searchFrnd, addFriend, removeFriend, getFriendList, uploadAvatar, logout, updateSocketId, sendFrndReq, acceptFrndReq, onOffStatusPoll, onlineFriends, updateLike, refreshAccessToken } from "../controllers/user.controllers.js"
import { verifyJWT, verifyStrictJWT } from "../middlewares/auth.middleware.js";
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary} from "cloudinary"
import multer from "multer"
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'quiz_app_avatars',
        public_id: (req, file) => 'avatar_' + Date.now(),
        resource_type: 'auto'
    }
});
const upload = multer({ storage: storage });
const userRouter = Router()

userRouter.route("/login").post(login)
userRouter.route("/logout").get(verifyStrictJWT, logout)
userRouter.route("/register").post(register)
userRouter.route("/getCurrentUser").get(verifyStrictJWT, getCurrentUser);
userRouter.route("/search").get(verifyStrictJWT, searchFrnd);
userRouter.route("/addFriend/:userID").get(verifyStrictJWT, addFriend);
userRouter.route("/removeFriend/:userID").get(verifyStrictJWT, removeFriend);
userRouter.route("/getFriendList").get(verifyStrictJWT, getFriendList);
userRouter.route("/updateSocketId/:socketId").get(verifyStrictJWT, updateSocketId);
userRouter.route("/sendFrndReq").post(verifyStrictJWT, sendFrndReq);
userRouter.route("/onOffStatusPoll").post(verifyStrictJWT, onOffStatusPoll);
userRouter.route("/acceptFrndReq/:userID").get(verifyStrictJWT, acceptFrndReq);
userRouter.route("/avatar").post(verifyStrictJWT, upload.single('avatar'), uploadAvatar);
userRouter.route("/onlineFriends").get(verifyStrictJWT, onlineFriends);
userRouter.route("/updateLike/:userID").post(verifyStrictJWT, updateLike);
userRouter.route("/refreshAccessToken").get(refreshAccessToken);

export default userRouter
