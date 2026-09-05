import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firebaseUID: {
        type: String,
        required: true,
        unique: true
    },
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: false
    },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

export { User };
