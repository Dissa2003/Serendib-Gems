// model/userModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  fullName: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  phone: { type: String },
  role: { type: String },
  userType: { type: String },
  password: { type: String, required: true },
  confirmPassword: { type: String },
  profilePic: { type: String },
}, { timestamps: true }); // Added timestamps for createdAt/updatedAt

const User = mongoose.model("User", userSchema);

export default User;