import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Gem from "../model/gemModel.js";
import { sendEmail } from "../utils/email.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

export const createGem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ errorMessage: "Image is required" });
    }

    const { name, type, weight, color, price, description, sellerName, sellerEmail } = req.body;
    const image = `/uploads/${req.file.filename}`;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sellerEmail)) {
      return res.status(400).json({ errorMessage: "Invalid email format" });
    }

    const newGem = new Gem({
      name,
      type,
      weight: parseFloat(weight),
      color,
      price: parseFloat(price),
      description,
      image,
      sellerName,
      sellerEmail
    });

    await newGem.save();

    res.status(201).json({
      message: "Gem added successfully.",
      gem: newGem,
    });
  } catch (error) {
    console.error("Error creating gem:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const getAllGems = async (req, res) => {
  try {
    console.log("Fetching all gems...");
    const gems = await Gem.find().sort({ createdAt: -1 });
    res.status(200).json(gems);
  } catch (error) {
    console.error("Error fetching gems:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const getGemById = async (req, res) => {
  try {
    const gem = await Gem.findById(req.params.id);

    if (!gem) {
      return res.status(404).json({ errorMessage: "Gem not found" });
    }

    res.status(200).json(gem);
  } catch (error) {
    console.error("Error fetching gem:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const deleteGem = async (req, res) => {
  try {
    const gemId = req.params.id;
    const gem = await Gem.findById(gemId);

    if (!gem) {
      return res.status(404).json({ errorMessage: "Gem not found" });
    }

    // Send email to seller before deletion
    const subject = `Gem Deleted: ${gem.name}`;
    const text = `Dear ${gem.sellerName},\n\nYour gem "${gem.name}" has been removed from the GemSystem inventory by an admin.\nIf you have any questions, please contact our support team.\n\nBest regards,\nGemSystem Team`;
    await sendEmail(gem.sellerEmail, subject, text);

    if (gem.image) {
      const imagePath = path.join(__dirname, "..", gem.image.replace(/^\//, ""));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Gem.findByIdAndDelete(gemId);

    res.status(200).json({ message: "Gem deleted successfully" });
  } catch (error) {
    console.error("Error deleting gem:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const toggleGemVerification = async (req, res) => {
  try {
    const gemId = req.params.id;
    const gem = await Gem.findById(gemId);

    if (!gem) {
      return res.status(404).json({ errorMessage: "Gem not found" });
    }

    gem.isVerified = !gem.isVerified;
    await gem.save();

    // Send email to seller
    const subject = `Gem Verification Status Updated: ${gem.name}`;
    const text = `Dear ${gem.sellerName},\n\nThe verification status of your gem "${gem.name}" has been updated.\nNew Status: ${gem.isVerified ? 'Verified' : 'Unverified'}\n\nBest regards,\nGemSystem Team`;
    await sendEmail(gem.sellerEmail, subject, text);

    res.status(200).json({
      message: `Gem ${gem.isVerified ? 'verified' : 'unverified'} successfully`,
      gem
    });
  } catch (error) {
    console.error("Error toggling gem verification:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const gemUpload = upload.single("image");