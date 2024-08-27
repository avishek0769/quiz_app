import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        username: this.username,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
       expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
    })
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id
    }, 
    process.env.REFRESH_TOKEN_SECRET,
    {
       expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
    })
}

export const User = mongoose.model("User", userSchema);
