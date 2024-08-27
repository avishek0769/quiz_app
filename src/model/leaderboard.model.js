import mongoose from "mongoose";


const leaderboardSchema = new mongoose.Schema({
    roomName: {
        type: String
    },
    participants: [{
        id: {
            type: String,
        },
        fullname: {
            type: String,
        },
        points: {
            type: Number,
        },
    }]
})

export const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);