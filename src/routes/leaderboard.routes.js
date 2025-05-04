import { Router } from "express";
import { createLeaderboard, getLeaderboard, pushUser, updatePoints } from "../controllers/leaderboard.controller.js";
import { verifyStrictJWT } from "../middlewares/auth.middleware.js";


const leaderboardRouter = Router();

leaderboardRouter.route("/create/:roomName").get(verifyStrictJWT, createLeaderboard)
leaderboardRouter.route("/updatePoints/:leadID/:roomID").post(verifyStrictJWT, updatePoints)
leaderboardRouter.route("/get/:leadID").get(verifyStrictJWT, getLeaderboard)
leaderboardRouter.route("/join/:leadID").post(verifyStrictJWT, pushUser)

export default leaderboardRouter;