import mongoose from "mongoose";
import { Room } from "../model/room.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const createRoom = asyncHandler(async (req, res)=>{
    const { name, topic } = req.body;
    const room = await Room.create({
        name, 
        topic,
        admin: req.user.fullname
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
    res.status(200).json(new ApiResponse(200, room, "User joined to the room Successfully"));
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
                            fullname: 1
                        }
                    }
                ]
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
    getRoom,
    deleteRoom
}