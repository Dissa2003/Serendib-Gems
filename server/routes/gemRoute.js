import express from "express";
import { createGem, getAllGems, getGemById, gemUpload, deleteGem, toggleGemVerification } from "../controller/Gemcontroller.js";

const router = express.Router();

router.post("/add", gemUpload, createGem);
router.get("/", getAllGems);
router.get("/:id", getGemById);
router.delete("/:id", deleteGem);
router.patch("/:id/verify", toggleGemVerification);

export default router;