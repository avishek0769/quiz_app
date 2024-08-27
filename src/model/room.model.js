import mongoose from "mongoose";


const roomSchema = new mongoose.Schema({
    name: {
        type : String,
        required: true
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
        type: String,
        required: true
    }
})

export const Room = mongoose.model("Room", roomSchema);