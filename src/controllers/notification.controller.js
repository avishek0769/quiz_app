import mongoose from "mongoose";
import { Notification } from "../model/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/user.model.js";


const getNoti = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { notification: false }
    )
    const notiArr = await Notification.aggregate([
        {
            $match: { receiver: new mongoose.Types.ObjectId(req.user._id) }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "sender",
                as: "sender",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                sender: {
                    $first: "$sender"
                }
            }
        }
    ])

    res.status(200).json(new ApiResponse(200, notiArr, "Notofications fetched"))
})

const removeNoti = asyncHandler(async (req, res) => {
    const { notiID } = req.params;
    const deleteNoti = await Notification.findByIdAndDelete(notiID);
    res.status(200).json(new ApiResponse(200, deleteNoti, "Notification deleted !"))
})

const addNoti = asyncHandler(async (req, res) => {
    const { receiver, sender, type } = req.query;
    
    const user = await Notification.findOne({
        receiver,
        sender,
        type
    })
    if(!user){
        await User.findByIdAndUpdate(
            receiver,
            { notification: true },
            { new: true }
        )
        const noti = await Notification.create({
            receiver,
            sender,
            type
        })
        res.status(202).json(new ApiResponse(202, noti, "Friend Request sent in HTTP in notification"));
    }
    else throw new ApiError(438, "Friend request already sent !");
})

export { 
    getNoti,
    removeNoti,
    addNoti
}