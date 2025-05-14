const express = require("express");
const router = express.Router();
const multer = require("multer");

// Insert Model
//const User = require("../Model/UserModel");

// Insert User Controller
const UserController = require("../Controllers/UserController");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./images");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + file.originalname;
        cb(null, uniqueSuffix);
    },
});
const upload = multer({ storage });

router.get("/", UserController.getAllUsers);
router.post("/", upload.single("profilePic"), UserController.addUsers);
router.post("/register", UserController.registerUser);
router.get("/:id", UserController.getById);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);
router.post("/login", UserController.loginUser);
router.post("/check-username", UserController.checkUsername); // New route

module.exports = router;