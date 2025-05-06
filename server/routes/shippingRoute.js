// routes/shippingRoute.js
import express from "express";
import {
  createShipping,
  getAllShippings,
  getShippingById,
  getShippingsByEmail,
  updateShippingStatus,
  updateTrackingNumber,
  deleteShipping,
  getShippingByTrackingNumber

} from "../controller/shippingController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new shipping order
router.post("/", createShipping);

// Get all shipping orders (admin only in a real app)
router.get("/", getAllShippings);

// Get shipping by ID
router.get("/:id", getShippingById);

// Get shipping by customer email
router.get("/customer/:email", getShippingsByEmail);

// Update shipping status (admin only in a real app)
router.patch("/:id/status", updateShippingStatus);

// Update tracking number (admin only in a real app)
router.patch("/:id/tracking", updateTrackingNumber);

// In your routes file (e.g., shippingRoutes.js)
router.delete('/:id', deleteShipping);

router.get('/track/:trackingNumber', getShippingByTrackingNumber);

export default router;
