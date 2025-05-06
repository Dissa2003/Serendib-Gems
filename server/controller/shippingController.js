import Shipping from "../model/shippingmodel.js";
import Gem from "../model/gemModel.js";
import { sendEmail } from "../utils/email.js";

// Create a new shipping order
export const createShipping = async (req, res) => {
  try {
    const {
      orderItem,
      quantity,
      customerEmail,
      shippingAddress,
      shippingMethod,
      totalAmount,
      status,
      transactionId,
    } = req.body;

    // Verify the gem exists
    const gem = await Gem.findById(orderItem);
    if (!gem) {
      return res.status(404).json({ message: "Gem not found" });
    }

    // Generate a random tracking number (in a real app, this would come from a shipping provider)
    const trackingNumber = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15);

    const newShipping = new Shipping({
      orderItem,
      quantity,
      customerEmail,
      shippingAddress,
      shippingMethod,
      totalAmount,
      status,
      transactionId,
      trackingNumber,
    });

    const savedShipping = await newShipping.save();
    res.status(201).json(savedShipping);
  } catch (error) {
    console.error("Error creating shipping:", error);
    res.status(500).json({ message: "Failed to create shipping order", error: error.message });
  }
};

// Get all shipping orders
export const getAllShippings = async (req, res) => {
  try {
    const shippings = await Shipping.find().populate("orderItem").sort({ createdAt: -1 });
    res.status(200).json(shippings);
  } catch (error) {
    console.error("Error fetching shippings:", error);
    res.status(500).json({ message: "Failed to fetch shipping orders", error: error.message });
  }
};

// Get shipping by ID
export const getShippingById = async (req, res) => {
  try {
    const shipping = await Shipping.findById(req.params.id).populate("orderItem");
    if (!shipping) {
      return res.status(404).json({ message: "Shipping order not found" });
    }
    res.status(200).json(shipping);
  } catch (error) {
    console.error("Error fetching shipping:", error);
    res.status(500).json({ message: "Failed to fetch shipping order", error: error.message });
  }
};

// Get shipping by customer email
export const getShippingsByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const shippings = await Shipping.find({ customerEmail: email })
      .populate("orderItem")
      .sort({ createdAt: -1 });
    res.status(200).json(shippings);
  } catch (error) {
    console.error("Error fetching shippings by email:", error);
    res.status(500).json({ message: "Failed to fetch shipping orders", error: error.message });
  }
};

// Get shipping by tracking number
export const getShippingByTrackingNumber = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const shipping = await Shipping.findOne({ trackingNumber }).populate("orderItem");
    if (!shipping) {
      return res.status(404).json({ message: "Shipping order not found" });
    }

    // Construct tracking updates based on status
    const updates = [
      {
        date: shipping.createdAt.toLocaleDateString(),
        time: shipping.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "Order Placed",
        location: "Online"
      },
      {
        date: shipping.createdAt.toLocaleDateString(),
        time: shipping.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "Processing",
        location: "Warehouse, Dallas, TX"
      }
    ];

    if (["shipped", "delivered", "cancelled"].includes(shipping.status)) {
      updates.push({
        date: new Date(shipping.updatedAt).toLocaleDateString(),
        time: new Date(shipping.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "Shipped",
        location: "Warehouse, Dallas, TX"
      });
    }

    if (shipping.status === "delivered") {
      updates.push({
        date: new Date(shipping.updatedAt).toLocaleDateString(),
        time: new Date(shipping.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "Delivered",
        location: `${shipping.shippingAddress.address}, ${shipping.shippingAddress.city}, ${shipping.shippingAddress.state}`
      });
    }

    if (shipping.status === "cancelled") {
      updates.push({
        date: new Date(shipping.updatedAt).toLocaleDateString(),
        time: new Date(shipping.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "Cancelled",
        location: "N/A"
      });
    }

    const response = {
      trackingNumber: shipping.trackingNumber,
      shippingId: shipping._id,
      status: shipping.status,
      estimatedDelivery: shipping.shippingMethod.estimatedDelivery,
      currentLocation: shipping.status === "delivered" 
        ? `${shipping.shippingAddress.city}, ${shipping.shippingAddress.state}`
        : "Distribution Center, Atlanta, GA",
      updates
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching shipping by tracking number:", error);
    res.status(500).json({ message: "Failed to fetch shipping order", error: error.message });
  }
};

// Update shipping status
export const updateShippingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedShipping = await Shipping.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedShipping) {
      return res.status(404).json({ message: "Shipping order not found" });
    }

    res.status(200).json(updatedShipping);
  } catch (error) {
    console.error("Error updating shipping status:", error);
    res.status(500).json({ message: "Failed to update shipping status", error: error.message });
  }
};

// Update tracking number
export const updateTrackingNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingNumber } = req.body;

    const updatedShipping = await Shipping.findByIdAndUpdate(
      id,
      { trackingNumber },
      { new: true }
    );

    if (!updatedShipping) {
      return res.status(404).json({ message: "Shipping order not found" });
    }

    // Send email notification to the customer
    const emailSubject = `Your Order #${id.slice(-8)} Tracking Number Updated`;
    const emailText = `
      Dear ${updatedShipping.shippingAddress.firstName} ${updatedShipping.shippingAddress.lastName},

      The tracking number for your order #${id.slice(-8)} has been updated.

      New Tracking Number: ${trackingNumber}
      Order Details:
      - Product: ${updatedShipping.orderItem?.name || 'N/A'}
      - Quantity: ${updatedShipping.quantity}
      - Total Amount: $${updatedShipping.totalAmount.toFixed(2)}
      - Estimated Delivery: ${updatedShipping.shippingMethod.estimatedDelivery}

      You can track your order here: http://localhost:3000/track-delivery?trackingNumber=${trackingNumber}

      Thank you for shopping with GemSystem!

      Best regards,
      The GemSystem Team
    `;

    await sendEmail(updatedShipping.customerEmail, emailSubject, emailText);

    res.status(200).json(updatedShipping);
  } catch (error) {
    console.error("Error updating tracking number:", error);
    res.status(500).json({ message: "Failed to update tracking number", error: error.message });
  }
};

// Delete a shipping order
export const deleteShipping = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedShipping = await Shipping.findByIdAndDelete(id);

    if (!deletedShipping) {
      return res.status(404).json({ message: "Shipping order not found" });
    }

    res.status(200).json({ message: "Shipping order deleted successfully" });
  } catch (error) {
    console.error("Error deleting shipping order:", error);
    res.status(500).json({ message: "Failed to delete shipping order", error: error.message });
  }
};