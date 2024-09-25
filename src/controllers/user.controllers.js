import jwt from "jsonwebtoken";
import mongoose from "mongoose"
import { User } from "../model/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Notification } from "../model/notification.model.js"
import { deleteFromCloud } from "../utils/deleteAvatar.js"

const AccessOptions = {
    httpOnly: true,
    // secure: true,
    maxAge: 86400000
    
}
const RefreshOptions = {
    httpOnly: true,
    // secure: true,
    maxAge: (86400000 * 7)
}
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new ApiError(500, "Some thing went wrong while generating Access & Refresh tokens")
    }
}

const refreshAccessTokenFunc = async (user) =>{
    try {
        const accessToken = await user.generateAccessToken();
        return accessToken;
    }
    catch (error) {
        throw new ApiError(500, "Some thing went wrong while refreshing Access token")
    }
}

const register = asyncHandler(async (req, res)=>{
    const { fullname, username, password } = req.body;
    
    const userExists = await User.findOne({ username });
    if(userExists) throw new ApiError(468, "Username already taken")

    const user = await User.create({
        fullname, username, password
    })
    
    res.status(200).json(new ApiResponse(200, { id: user._id }, "User registered succesfully"))
})

const login = asyncHandler(async (req, res)=>{
    const { username, password } = req.body;

    const user = await User.findOne({
        username, password
    })
    if(!user) throw new ApiError(469, "User credentials are wrong");

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findByIdAndUpdate(
        user._id,
        { refreshToken: refreshToken },
        { new: true }
    ).select("-password -refreshToken")

    res
    .status(200)
    .cookie("accessToken", accessToken, AccessOptions)
    .cookie("refreshToken", refreshToken, RefreshOptions)
    .json(new ApiResponse(200, { id: user._id }, "User registered succesfully"))
})

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: "" } },
        { new: true }
    )
    res
    .status(200)
    .clearCookie("accessToken", AccessOptions)
    .clearCookie("refreshToken", RefreshOptions)
    .json(new ApiResponse(200, {}, "User Loogged out Successfully"))
})

const searchFrnd = asyncHandler(async (req, res) => {
    const { search } = req.query;

    const usersByFullname = await User.find({ 
        fullname: { $regex: search, $options: "i" }
    }).select("-refreshToken -password -friendList -likes -totalPoints");

    const usersByUsername = await User.find({
        username: { $regex: search, $options: "i" }
    }).select("-refreshToken -password -friendList -likes -totalPoints");
    
    res.status(200).json(new ApiResponse(200, {
        usersByFullname,
        usersByUsername
    }, "Users found !"))
})

const addFriend = asyncHandler(async (req, res) => {
    const { userID } = req.params;
    const added = await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { friendList: userID } },
        { new: true }
    )
    res.status(200).json(new ApiResponse(200, { list: added.friendList }, "Friend added !!"))
})

const removeFriend = asyncHandler(async (req, res) => {
    const { userID } = req.params;
    const me = await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { friendList: userID } },
        { new: true }
    )
    const frnd = await User.findByIdAndUpdate(
        userID,
        { $pull: { friendList: req.user._id } },
        { new: true }
    )
    res.status(200).json(new ApiResponse(200, { list: me.friendList }, "Friend removed !!"))
})

const getFriendList = asyncHandler(async (req, res) => {
    const list = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req.user._id) }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "friendList",
                as: "friendList",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        }
    ])
    res.status(200).json(new ApiResponse(200, list[0], "Friend List fetched !!"))
})

const uploadAvatar = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if(user.avatar.startsWith("https")) await deleteFromCloud(user.avatar, "image");
    user.avatar = req.file.path;
    await user.save()
    res.status(200).json(new ApiResponse(200, { imageUrl: req.file.path },'Image uploaded to Cloudinary successfully!'));
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -likes -totalPoints");
    res.status(200).json(new ApiResponse(200, user, "Current User fetched Successfully !!"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if(!token) throw new ApiError(489, "Refresh Token expired !");

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id);
    if(!user) throw new ApiError(450, "User not found, Refresh Token is altered !");
    
    let refreshedAccessToken
    if(user.refreshToken == token){
        refreshedAccessToken = await refreshAccessTokenFunc(user)
    }
    else throw new ApiError(450, "Refresh Token doesn't match !");

    res
    .status(200)
    .cookie("accessToken", refreshedAccessToken, AccessOptions)
    .json(new ApiResponse(200, { success: true }, "Access Token refreshed successfully"))

})

const updateSocketId = asyncHandler(async (req, res) => {
    const { socketId } = req.params;
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { socketId: socketId },
        { new : true }
    )
    res.status(200).json(new ApiResponse(200, { socketId: user.socketId }, "Socket id updated !!"))
})

const sendFrndReq = asyncHandler(async (req, res) => {
    const { userID, currentUser, roomPart } = req.body;
    const user = await User.findById(userID);
    
    if(req.app.locals.io.sockets.sockets.has(user.socketId)){
        req.app.locals.io.to(user.socketId).emit("frndReq", {...currentUser, roomPart});
        res.status(201).json(new ApiResponse(201, { }, "Friend Request sent in WS"));
    }
    else {
        const user = await Notification.findOne({
            receiver : userID,
            sender: currentUser._id,
            type: 0
        })
        if(!user){
            await User.findByIdAndUpdate(
                receiver,
                { notification: true },
                { new: true }
            )
            const noti = await Notification.create({
                receiver : userID,
                sender: currentUser._id,
                type: 0
            })
            res.status(202).json(new ApiResponse(202, noti, "Friend Request sent in HTTP in notification"));
        }
        else{
            throw new ApiError(438, "Friend request already sent !");
        }
    }
})

const acceptFrndReq = asyncHandler(async (req, res) => {
    const { userID } = req.params;
    const me = await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { friendList: userID } },
        { new: true }
    )
    const frnd = await User.findByIdAndUpdate(
        userID,
        { $addToSet: { friendList: req.user._id } },
        { new: true }
    )
    req.app.locals.io.to(frnd.socketId).emit("frndReqAccepted", { frndName: me.fullname, frndID: me._id})
    res.status(200).json(new ApiResponse(200, {me, frnd}, "Friend added to list !"))
})

const onOffStatusPoll = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    let obj = {};
    for (const id of ids) {
        let user = await User.findById(id);
        let socketId = user.socketId;
        let bool = req.app.locals.io.sockets.sockets.has(socketId);
        obj[id] = bool;
    }
    res.status(200).json(new ApiResponse(200, obj, "Online Friend's status fetched !"));
})

const onlineFriends = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req.user._id) }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "friendList",
                as: "friendList",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1,
                            socketId: 1
                        }
                    }
                ]
            }
        }
    ])
    let onlineFriendList = user[0].friendList.filter(frnd => req.app.locals.io.sockets.sockets.has(frnd.socketId));
    res.status(200).json(new ApiResponse(200, onlineFriendList, "Online friend list fetched !!"))
})

const updateLike = asyncHandler(async (req, res) => {
    const { userID } = req.params;
    const { like } = req.body;

    await User.findByIdAndUpdate(
        userID,
        { $inc: {likes: like} },
        { new: true }
    )
    res.status(200).json(new ApiResponse(200, {}, "Like updated"))
})

export {
    register,
    login,
    logout,
    getCurrentUser,
    searchFrnd,
    addFriend,
    removeFriend,
    getFriendList,
    uploadAvatar,
    updateSocketId,
    sendFrndReq,
    acceptFrndReq,
    onOffStatusPoll,
    onlineFriends,
    updateLike,
    refreshAccessToken
}
