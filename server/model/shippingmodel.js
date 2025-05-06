// models/shippingModel.js
import mongoose from "mongoose";

const shippingSchema = new mongoose.Schema(
  {
    orderItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gem",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    shippingAddress: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
        default: "United States",
      },
      phone: {
        type: String,
        required: true,
      },
    },
    shippingMethod: {
      name: {
        type: String,
        required: true,
      },
      cost: {
        type: Number,
        required: true,
      },
      estimatedDelivery: {
        type: String,
        required: true,
      },
    },
    trackingNumber: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Finance",
    },
  },
  { timestamps: true }
);

const Shipping = mongoose.model("Shipping", shippingSchema);

export default Shipping;
