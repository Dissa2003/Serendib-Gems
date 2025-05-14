const User = require("../Model/UserModel");

// Display
const getAllUsers = async (req, res, next) => {
    let Users;
    try {
        Users = await User.find();
    } catch (err) {
        console.log(err);
    }
    if (!Users) {
        return res.status(404).json({ message: "Users not found" });
    }
    return res.status(200).json({ Users });
};

// Data insert (Admin)
const addUsers = async (req, res, next) => {
    const { fullName, username, email, phoneNumber, role, password, confirmPassword } = req.body;
    const profilePic = req.file ? req.file.filename : "";

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }
    let users;
    try {
        users = new User({ fullName, username, email, phoneNumber, role, password, confirmPassword, profilePic });
        await users.save();
    } catch (err) {
        console.log(err);
        if (err.code === 11000) {
            return res.status(400).json({ message: "Username or email already exists" });
        }
        return res.status(500).json({ message: "Unable to add users" });
    }
    if (!users) {
        return res.status(404).json({ message: "Unable to add users" });
    }
    return res.status(200).json({ users });
};

// Public user registration
const registerUser = async (req, res, next) => {
    const { firstName, username, email, phone, password, confirmPassword, userType } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    let user;
    try {
        // Ensure username is unique by appending a suffix if needed
        let finalUsername = username.toLowerCase().replace(/\s+/g, '');
        let suffix = 1;
        while (await User.findOne({ username: finalUsername })) {
            finalUsername = `${username.toLowerCase().replace(/\s+/g, '')}-${suffix}`;
            suffix++;
        }

        user = new User({
            firstName,
            username: finalUsername,
            email,
            phoneNumber: phone,
            password,
            confirmPassword,
            userType,
        });
        await user.save();
        return res.status(200).json({ message: "Registration successful", user });
    } catch (err) {
        console.log(err);
        if (err.code === 11000) {
            return res.status(400).json({ message: "Email or username already exists" });
        }
        return res.status(500).json({ message: "Unable to register user" });
    }
};

// Check username availability
const checkUsername = async (req, res, next) => {
    const { username } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        return res.status(200).json({ available: !existingUser });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error checking username" });
    }
};

// Get by Id
const getById = async (req, res, next) => {
    const id = req.params.id;
    let users;
    try {
        users = await User.findById(id);
    } catch (err) {
        console.log(err);
    }
    if (!users) {
        return res.status(404).json({ message: "User Not Found" });
    }
    return res.status(200).json({ user: users });
};

// Update User Details
const updateUser = async (req, res, next) => {
    const id = req.params.id;
    const { fullName, username, email, phoneNumber, role, password, confirmPassword } = req.body;
    let users;
    try {
        users = await User.findByIdAndUpdate(id, {
            fullName,
            username,
            email,
            phoneNumber,
            role,
            password,
            confirmPassword,
        });
        users = await users.save();
    } catch (err) {
        console.log(err);
    }
    if (!users) {
        return res.status(404).json({ message: "Unable to update User Details" });
    }
    return res.status(200).json({ users });
};

// Delete user
const deleteUser = async (req, res, next) => {
    const id = req.params.id;
    let users;
    try {
        users = await User.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }
    if (!users) {
        return res.status(404).json({ message: "Unable to Delete User Details" });
    }
    return res.status(200).json({ users });
};

// Login user
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

        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const { password: _, confirmPassword: __, ...userDetails } = user._doc;
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: userDetails,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.getAllUsers = getAllUsers;
exports.addUsers = addUsers;
exports.registerUser = registerUser;
exports.checkUsername = checkUsername;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.loginUser = loginUser;