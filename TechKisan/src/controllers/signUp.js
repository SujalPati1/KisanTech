import admin from "../config/firebase.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
    try {
        console.log("🚀 Backend received signup request:", req.body); // Debug log

        const { firebaseUID, userName, email, password, refreshToken } = req.body;

        if (!firebaseUID || !userName || !email || !password || !refreshToken) {
            console.log("❌ Missing required fields in request.");
            return res.status(400).json({ message: "All fields are required" });
        }

        console.log("🔍 Checking if user already exists in MongoDB...");
        const existingUser = await User.findOne({ firebaseUID });
        if (existingUser) {
            console.log("❌ User already exists in MongoDB");
            return res.status(400).json({ message: "User already exists" });
        }

        console.log("🔑 Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);  // ✅ Hashing password here

        console.log("💾 Storing user in MongoDB...");
        const user = new User({
            firebaseUID,
            userName,
            email,
            password: hashedPassword, // ✅ Storing hashed password
            refreshToken
        });

        await user.save();
        console.log("✅ User saved successfully in MongoDB:", user);

        return res.status(201).json({
            message: "User created successfully and stored in MongoDB.",
        });

    } catch (err) {
        console.error("❌ Error storing user in MongoDB:", err);
        return res.status(500).json({ message: "MongoDB Error: " + err.message });
    }
};
