import mongoose from "mongoose";


const roomSchema = new mongoose.Schema({
    name: {
        type : String,
        required: true
    },
    currentQuestionAnsweredBy: {
        type: Number,
        default: 0
    },
    topic: {
        type : String,
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

export const Room = mongoose.model("Room", roomSchema);