import { Router } from "express";
import { createRoom, deleteRoom, getRoom, joinRoom, kickRoom, leaveRoom, roomInvitation } from "../controllers/room.controllers.js";
import { verifyStrictJWT } from "../middlewares/auth.middleware.js";


const roomRouter = Router()

roomRouter.route("/create").post(verifyStrictJWT, createRoom);
roomRouter.route("/join/:roomID").get(verifyStrictJWT, joinRoom);
roomRouter.route("/leave/:roomID").get(verifyStrictJWT, leaveRoom);
roomRouter.route("/kick/:roomID/:userID").get(verifyStrictJWT, kickRoom);
roomRouter.route("/getRoom/:roomID").get(verifyStrictJWT, getRoom);
roomRouter.route("/delete/:roomID").get(verifyStrictJWT, deleteRoom);
roomRouter.route("/roomInvitation").post(verifyStrictJWT, roomInvitation);

export default roomRouter
