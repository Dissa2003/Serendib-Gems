import GemCuttingRequest from '../model/cuttingmodel.js';
import { sendEmail } from '../utils/email.js';

// Create a new gem cutting request
export const createGemCuttingRequest = async (req, res) => {
  try {
    const gemCuttingRequest = new GemCuttingRequest(req.body);
    const savedRequest = await gemCuttingRequest.save();
    
    // Send confirmation email to user
    await sendEmail(
      savedRequest.email,
      'Gem Cutting Request Received',
      `Dear ${savedRequest.userName},\n\nYour gem cutting request for ${savedRequest.gemstoneType} has been received. We'll notify you when the status changes.\n\nBest regards,\nGemSystem Team`
    );
    
    res.status(201).json({
      success: true,
      data: savedRequest,
      message: 'Gem cutting request created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all gem cutting requests
export const getAllGemCuttingRequests = async (req, res) => {
  try {
    const requests = await GemCuttingRequest.find()
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single gem cutting request by ID
export const getGemCuttingRequest = async (req, res) => {
  try {
    const request = await GemCuttingRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Gem cutting request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a gem cutting request status
export const updateGemCuttingRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const request = await GemCuttingRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Gem cutting request not found'
      });
    }
    
    // Send status update email to user
    const statusDisplay = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    
    await sendEmail(
      request.email,
      'Gem Cutting Request Status Update',
      `Dear ${request.userName},\n\nYour gem cutting request for ${request.gemstoneType} has been updated to "${statusDisplay[status]}".\n\nBest regards,\nGemSystem Team`
    );
    
    res.status(200).json({
      success: true,
      data: request,
      message: 'Request status updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a gem cutting request
export const deleteGemCuttingRequest = async (req, res) => {
  try {
    const request = await GemCuttingRequest.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Gem cutting request not found',
      });
    }

    // Send deletion notification email to user
    await sendEmail(
      request.email,
      'Gem Cutting Request Deleted',
      `Dear ${request.userName},\n\nYour gem cutting request for ${request.gemstoneType} has been deleted.\n\nBest regards,\nGemSystem Team`
    );

    res.status(200).json({
      success: true,
      message: 'Gem cutting request deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};