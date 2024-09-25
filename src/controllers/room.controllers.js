import mongoose from "mongoose";
import { Room } from "../model/room.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/user.model.js";


const createRoom = asyncHandler(async (req, res)=>{
    const { name, topic } = req.body;
    const room = await Room.create({
        name, 
        topic,
        admin: req.user._id
    })
    res.status(200).json(new ApiResponse(200, room, "Room created Successfully"));
})

const joinRoom = asyncHandler(async (req, res) => {
    const { roomID } = req.params;
    const room = await Room.findByIdAndUpdate(
        roomID,
        { $addToSet: { participants: req.user._id } },
        { new: true }
    )
    if(!room) throw new ApiError(439, "Room not found !")
    res.status(200).json(new ApiResponse(200, room, "User joined to the room Successfully"));
})

const leaveRoom = asyncHandler(async (req, res) => {
    const { roomID } = req.params;
    const room = await Room.findByIdAndUpdate(
        roomID,
        { $pull: { participants: req.user._id } },
        { new: true }
    )
    res.status(200).json(new ApiResponse(200, room, "User left the room Successfully"));
})

const kickRoom = asyncHandler(async (req, res) => {
    const { roomID, userID } = req.params;
    const room = await Room.findByIdAndUpdate(
        roomID,
        { $pull: { participants: userID } },
        { new: true }
    )
    const user = await User.findById(userID);
    req.app.locals.io.to(roomID).emit("urKicked", {userID: user._id, fullname: user.fullname})
    res.status(200).json(new ApiResponse(200, room, "User kicked from the room Successfully"));
})

const getRoom = asyncHandler(async (req, res) => {
    const { roomID } = req.params;
    const room = await Room.aggregate([
        {
            $match: { _id : new mongoose.Types.ObjectId(roomID) }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "participants",
                as: "participants",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            avatar: 1,
                            username: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "admin",
                as: "admin",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    },
                ]
            }
        },
        {
            $addFields: {
                admin: {
                    $first: "$admin"
                }
            }
        }
    ])
    res.status(200).json(new ApiResponse(200, room[0], "Room detailes fetched !"))
})

const deleteRoom = asyncHandler(async (req, res) => {
    const { roomID } = req.params;
    const room = await Room.findByIdAndDelete(roomID);
    res.status(200).json(new ApiResponse(200, room, "Room deleted Successfully !!"));
})

export {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoom,
    deleteRoom,
    kickRoom
}