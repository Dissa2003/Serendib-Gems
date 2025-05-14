// index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import userRoutes from "./routes/userRoute.js";
import staffRoute from "./routes/staffRoute.js";
import gemRoutes from "./routes/gemRoute.js";
import financeRoutes from "./routes/financeRoute.js";
import authRoutes from "./routes/authRoutes.js";
import shippingRoutes from "./routes/shippingRoute.js";
import cuttingRoutes from "./routes/cuttingRoute.js";
import emailRoutes from "./routes/emailRoute.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors());

// Create directories if they don't exist
const uploadsDir = path.join(__dirname, "uploads");
const fileDir = path.join(__dirname, "file");
const imagesDir = path.join(__dirname, "images");

[uploadsDir, fileDir, imagesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static files
app.use("/uploads", express.static(uploadsDir));
app.use("/files", express.static(fileDir));
app.use("/images", express.static(imagesDir));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/staff", staffRoute); // Fixed: Added staffRoute
app.use("/api/gem", gemRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/gem-cutting", cuttingRoutes);
app.use("/api/email", emailRoutes);

const PORT = process.env.PORT || 8000;
const MONGOURL = process.env.MONGO_URL;

mongoose
  .connect(MONGOURL)
  .then(() => {
    console.log("DB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  })
  .catch((error) => console.log("DB Connection Error:", error));