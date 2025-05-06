// routes/userRoute.js
import express from "express";
import multer from "multer";
import UserController from "../controller/userController.js";
import authMiddleware from "../middleware/authMiddleware1.js"; // Added auth middleware

const router = express.Router();

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

// Protected routes with auth middleware
router.get("/", authMiddleware, UserController.getAllUsers);
router.post("/", authMiddleware, upload.single("profilePic"), UserController.addUsers);
router.get("/:id", authMiddleware, UserController.getById);
router.put("/:id", authMiddleware, UserController.updateUser);
router.delete("/:id", authMiddleware, UserController.deleteUser);

// Public routes
router.post("/register", UserController.registerUser);
router.post("/login", UserController.loginUser);
router.post("/check-username", UserController.checkUsername);

export default router;