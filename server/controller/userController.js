// controller/userController.js
import User from "../model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const getAllUsers = async (req, res, next) => {
  try {
    const Users = await User.find().select('-password'); // Exclude password from response
    if (!Users || Users.length === 0) {
      return res.status(200).json({ Users: [], message: "No users found in the database" });
    }
    return res.status(200).json({ Users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const addUsers = async (req, res, next) => {
  const { fullName, username, email, phoneNumber, role, password } = req.body;
  const profilePic = req.file ? req.file.filename : "";

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      fullName,
      username,
      email,
      phoneNumber,
      role,
      password: hashedPassword,
      profilePic,
    });
    await user.save();
    const { password: _, ...userDetails } = user._doc;
    return res.status(201).json({ user: userDetails });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Username or email already exists" });
    }
    return res.status(500).json({ message: "Unable to add users" });
  }
};

const registerUser = async (req, res, next) => {
  const { firstName, username, email, phone, password, userType } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    let finalUsername = username.toLowerCase().replace(/\s+/g, "");
    let suffix = 1;
    while (await User.findOne({ username: finalUsername })) {
      finalUsername = `${username.toLowerCase().replace(/\s+/g, "")}-${suffix}`;
      suffix++;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      username: finalUsername,
      email,
      phoneNumber: phone,
      password: hashedPassword,
      userType,
    });
    await user.save();
    const { password: _, ...userDetails } = user._doc;
    return res.status(201).json({ message: "Registration successful", user: userDetails });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email or username already exists" });
    }
    return res.status(500).json({ message: "Unable to register user" });
  }
};

const checkUsername = async (req, res, next) => {
  const { username } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    return res.status(200).json({ available: !existingUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error checking username" });
  }
};

const getById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res, next) => {
  const id = req.params.id;
  const { fullName, username, email, phoneNumber, role, password } = req.body;
  try {
    let updateData = { fullName, username, email, phoneNumber, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update user details" });
  }
};

const deleteUser = async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to delete user" });
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const { password: _, ...userDetails } = user._doc;
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: userDetails,
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export default {
  getAllUsers,
  addUsers,
  registerUser,
  checkUsername,
  getById,
  updateUser,
  deleteUser,
  loginUser,
};