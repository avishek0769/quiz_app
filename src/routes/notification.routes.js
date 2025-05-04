import { Router } from "express";
import { verifyStrictJWT } from "../middlewares/auth.middleware.js"
import { addNoti, getNoti, removeNoti } from "../controllers/notification.controller.js";

const notiRouter = Router()

notiRouter.route("/getNoti").get(verifyStrictJWT, getNoti)
notiRouter.route("/addNoti").get(verifyStrictJWT, addNoti)
notiRouter.route("/removeNoti/:notiID").get(verifyStrictJWT, removeNoti)

export default notiRouter
