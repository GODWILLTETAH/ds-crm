const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        contact: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        gender: {
            type: String,
            enum: ["M", "F"],
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "moderator", "admin"],
            required: true,
            default: "user",
        },
        verificationCode: {
            type: Number,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        passwordResetCode: {
            type: String,
        },
        image: {
            type: String,
            default: "no-image.png",
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
