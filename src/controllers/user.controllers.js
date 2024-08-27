import { User } from "../model/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const AccessOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 86400000
    
}
const RefreshOptions = {
    httpOnly: true,
    secure: true,
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

const register = asyncHandler(async (req, res)=>{
    console.log(fullname, username, password);
    if(!fullname || !username || !password){
        throw new ApiError(401, "Feilds are missing in backend");
    }
    const user = await User.create({
        fullname, username, password
    })
    
    res.status(200).json(new ApiResponse(200, user, "User registered succesfully"))
})

const login = asyncHandler(async (req, res)=>{
    const { username, password } = req.body;

    if(!username || !password){
        throw new ApiError(401, "Feilds are missing in backend");
    }
    const user = await User.findOne({
        username, password
    })
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
    .json(new ApiResponse(200, loggedInUser, "User registered succesfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.status(200).json(new ApiResponse(200, user, "Current User fetched Successfully !!"));
})

export {
    register,
    login,
    getCurrentUser
}
