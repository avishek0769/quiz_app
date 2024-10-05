import { Leaderboard } from "../model/leaderboard.model.js";
import { Room } from "../model/room.model.js";
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createLeaderboard = asyncHandler(async (req, res) => {
    const { roomName } = req.params;
    const leaderboard = await Leaderboard.create({
        roomName
    })
    res.status(200).json(new ApiResponse(200, leaderboard, "Leaderboard created successfully !!"));
})

const updatePoints = asyncHandler(async (req, res) => {
    const { leadID, roomID } = req.params;
    const { totalParti } = req.query;
    const { id, points } = req.body;

    try {
        const leaderboard = await Leaderboard.findById(leadID);
        if (!leaderboard) {
            throw new ApiError(404, "Leaderboard not found !!")
        }

        const participant = leaderboard.participants.find(p => p.id === id);
        if (!participant) {
            throw new ApiError(404, "Participant not found !!")
        }

        participant.points += points;
        await leaderboard.save();

        await User.findByIdAndUpdate(
            id,
            { $inc: {totalPoints: points} },
            { new: true }
        )
        const room = await Room.findByIdAndUpdate(
            roomID,
            { $inc: {currentQuestionAnsweredBy: 1} },
            { new: true }
        )
        if(room.currentQuestionAnsweredBy == Number(totalParti)){
            room.currentQuestionAnsweredBy = 0;
            room.save();
            res.status(200).json(new ApiResponse(200, {moveOn: true, currentQ: room.currentQuestionAnsweredBy, totalParti}, "Points updated successfully"));
        }
        else res.status(200).json(new ApiResponse(200, {moveOn: false, currentQ: room.currentQuestionAnsweredBy, totalParti}, "Points updated successfully"));
    }
    catch (error) {
        // throw new ApiError(501, error.message);
        console.log(error);
    }
});

const pushUser = asyncHandler(async (req, res) => {
    const { leadID } = req.params;
    const { _id, fullname, points } = req.body;
    const leaderboard = await Leaderboard.findByIdAndUpdate(
        leadID,
        { 
            $push: {
                participants: {
                    id: _id,
                    fullname,
                    points
                }
            } 
        },
        { new: true }
    )
    res.status(200).json(200, {success: true}, "User pushed")
})

const getLeaderboard = asyncHandler(async (req, res) => {
    const { leadID } = req.params;
    const leaderboard = await Leaderboard.findById(leadID);
    res.status(200).json(new ApiResponse(200, leaderboard, "Leaderboard fetched !!"))
})

export{
    updatePoints,
    createLeaderboard,
    getLeaderboard,
    pushUser
}