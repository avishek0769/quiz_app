import mongoose, { Schema } from "mongoose";
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
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAowMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABgcDBAUCAf/EADUQAAICAQIEAgcGBwEAAAAAAAABAgMEBREGITFBUWESE3GBkaGxQlJywdHhFCMlMjNigiL/xAAWAQEBAQAAAAAAAAAAAAAAAAAAAQL/xAAWEQEBAQAAAAAAAAAAAAAAAAAAARH/2gAMAwEAAhEDEQA/ALSABpkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADmZev6XiScbMqEprrGtOe3wCumDi1cUaTZL0XfOHnOtpfE61F9ORWrMe2FkH0lCW6AyAAIAAAAAAAAAAAAAAAAAAAeLroUUzuumoVwW8pPsj2Q7jbUXO2Gn1SfoQ2nZt3fZP3cwOfrnEORqU5VUt1YvRQT2cvN/ocUAuIGxg52TgXeuxLHCffwftXc1wCLI0LWa9Wx29lC+H+Svw815HTKv0zNs07Nryat24f3RXdd0WbVZC6qFtb3hOKkn5PmRXsAAAAAAAAAAAAAAAAAAF1Ks1G+WTn5F8m252Sfu35fItPbfdeKKmtW1s14SYHkAGkAAKQLB4Qvd2hVRk93VKUF7N918mV8TvgmLWjzf3rn9EZVIAAAAAAAAAAAAAAAAAAARWWuY7xdXy6duXrHKPsfNfUs0jHGWlSvqjnY8d7Kl6NiXVw8fd9AIWBsDSAAIoWPwzjvG0PFjJbSnF2P/AKe/0aIXoGlz1PPhBx/kQfpWy7beHtZY6SSSSSS6eRB9AAAAAAAAAAAAAAAAAAAAARzVuFMfKsd2DNUWSe7ra3g3+RH7uGNWqk0sdWLxrmn8nzLCbSi5S5JeL5GpZqmn1P0bc7HT8PWICCQ4d1eT2/gpr8Uor8zp4HB983GWffGqHeNf/p/HoiTQ1jS5PZZ+On+M26bqr1vTbCxeNck/oBjw8OjBojRi1qFa8O/m/EzgAAAAAAAAAAAAAAAAAADm65rFOk0KU16d09/V177b+b8gNrNzMfBpduVaq4efV+xET1Hi++1uGn1qmHayxbyfu6I4Gdm5Gfe78qxzm+i7R8kuxrgZsrLycuXpZN1lr/3luYenToAXED7FuElKDcZL7S5M+AYOzgcS6jiNKdvr619m3m/j1RK9I4gxNTagm6b+9U319j7ldhPZprk1z3XZhYtsET4c4lcpQw9Rnu21Gu5/SX6ksIAAAAAAAAAAAAADV1LOq07DsybuaguUfvPsitc7MuzsqeRfLec348kuyXkdrjPUHkZ6xK5fysfrt9qfd+7l8yPAAAVKAAoAAAAABNuEdZeXV/BZMt7q1vCT6zj4e1EJMuLkW4uTXkUy2srkmmRVrAw4eTDLxasir+yyKkl4GYgAAAAAAAAGHLvjjYt2RPpVBzfnstzMcfiy11aFkbcvWOMPc3+zAr6yc7Zysse85tyb82eQCxKAAoAAAAAAAAAAiprwPlOzCuxZvd0z9KP4ZfuvmSYgvBFrhq1lfayl7+5p/qTogAAAAAAAAHA41f8ARkvG6H5n0AQIAFjIACqAAAAAAAAAADtcIPbXavOE/oWC+oBFgACAAAP/2Q=="
    },
    socketId: {
        type: String
    },
    likes:{
        type: Number,
        default: 0
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    friendList: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    notification: {
        type: Boolean,
        default: false
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
