const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: function() { return !this.fullName; }, // Required for public users
    },
    lastName: {
        type: String,
        required: false, // No longer required
    },
    fullName: {
        type: String,
        required: function() { return !this.firstName; }, // Required for admin-added users
    },
    username: {
        type: String,
        required: true, // Required for all users
        unique: true,
        sparse: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: function() { return this.fullName; }, // Required for admin-added users
        enum: ["Inventory Manager", "Gem Cutter", "Financial Manager", "Delivery Manager", "Employee"],
        default: null,
    },
    userType: {
        type: String,
        required: function() { return this.firstName; }, // Required for public users
        enum: ["buyer", "seller", "both buyer and seller"],
        default: null,
    },
    password: {
        type: String,
        required: true,
    },
    confirmPassword: {
        type: String,
        required: true,
        validate: {
            validator: function() {
                return this.password === this.confirmPassword;
            },
            message: "Passwords do not match",
        },
    },
    profilePic: {
        type: String,
        default: "",
    },
});

module.exports = mongoose.model("UserModel", userSchema);