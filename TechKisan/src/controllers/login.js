import admin from "../config/firebase.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        console.log("🔍 Checking Firebase for user...");
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(email);
        } catch (error) {
            console.error("❌ Firebase user not found:", error.message);
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // Ensure email is verified
        if (!userRecord.emailVerified) {
            return res.status(403).json({ message: "Email not verified. Please check your inbox for the verification link." });
        }

        console.log("🔍 Checking MongoDB for user...");
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found in database." });
        }

        // Compare hashed password stored in MongoDB
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // Generate Firebase Auth Token
        console.log("✅ Generating Firebase Auth Token...");
        const token = await admin.auth().createCustomToken(userRecord.uid);

        return res.status(200).json({
            message: "Login successful",
            token: token, 
            user: {
                userName: user.userName,
                email: user.email,
                firebaseUID: user.firebaseUID,
            }
        });

    } catch (error) {
        console.error("❌ Login error:", error);
        return res.status(500).json({ message: "Login failed." });
    }
};
