import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({

    message: {

        type: String,
        required: true

    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
},
    {
        timestamps: true,
    }

);

export const Messages = mongoose.model('Messages', messageSchema);