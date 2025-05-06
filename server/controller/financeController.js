import Finance from "../model/financeModel.js";
import Gem from "../model/gemModel.js";
import { sendEmail } from "../utils/email.js";
import { validationResult } from "express-validator";

// Create new transaction
export const createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      transactionType,
      amount,
      currency,
      paymentMethod,
      description,
      relatedGem,
      paymentDetails,
      email,
      metadata
    } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (paymentMethod === 'credit-card' && paymentDetails) {
      // Ensure cardLastFour is set if cardNumber is provided
      if (paymentDetails.cardNumber && !paymentDetails.cardLastFour) {
        paymentDetails.cardLastFour = paymentDetails.cardNumber.slice(-4);
      }
    }

    const transaction = new Finance({
      transactionType,
      amount,
      currency,
      paymentMethod,
      description,
      relatedGem,
      paymentDetails,
      email,
      metadata,
      status: 'pending'
    });

    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ 
      message: "Error creating transaction", 
      error: error.message 
    });
  }
};

// Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    // Add query parameters support for filtering
    const { status, transactionType, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (transactionType) filter.transactionType = transactionType;
    
    // Date range filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const transactions = await Finance.find(filter)
      .populate('relatedGem', 'name price description')
      .sort({ createdAt: -1 }); // Sort by newest first
      
    // Calculate summary statistics
    const totalAmount = transactions.reduce((sum, transaction) => {
      // Only count completed transactions
      if (transaction.status === 'completed' && transaction.transactionType === 'sale') {
        return sum + transaction.amount;
      }
      return sum;
    }, 0);
    
    const totalRefunds = transactions.reduce((sum, transaction) => {
      if (transaction.status === 'refunded' || 
         (transaction.status === 'completed' && transaction.transactionType === 'refund')) {
        return sum + transaction.amount;
      }
      return sum;
    }, 0);
    
    res.status(200).json({
      transactions,
      summary: {
        totalTransactions: transactions.length,
        totalAmount,
        totalRefunds,
        netRevenue: totalAmount - totalRefunds
      }
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ 
      message: "Error fetching transactions", 
      error: error.message 
    });
  }
};

// Get transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Finance.findById(req.params.id)
      .populate('relatedGem', 'name price description');
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    res.status(200).json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ 
      message: "Error fetching transaction", 
      error: error.message 
    });
  }
};

// Update transaction status
export const updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const transaction = await Finance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('relatedGem', 'name price description');
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    // Send email notification with status-specific message
    let emailMessage;
    const gemName = transaction.relatedGem?.name;
    const amountDetails = `Amount: ${transaction.amount} ${transaction.currency}`;
    
    switch (status) {
      case 'pending':
        emailMessage = `Dear Customer,\n\nYour transaction is currently being processed.\n${amountDetails}${gemName ? `\nGem: ${gemName}` : ''}\n\nWe will notify you once it is updated.\n\nBest regards,\nSerendib Gems`;
        break;
      case 'completed':
        emailMessage = `Dear Customer,\n\nYour transaction has been successfully completed.\n${amountDetails}${gemName ? `\nGem: ${gemName}` : ''}\n\nThank you for choosing Serendib Gems!\n\nBest regards,\nSerendib Gems`;
        break;
      case 'failed':
        emailMessage = `Dear Customer,\n\nWe regret to inform you that your transaction could not be processed.\n${amountDetails}${gemName ? `\nGem: ${gemName}` : ''}\n\nPlease contact our support team at support@serendibgems.com for assistance.\n\nBest regards,\nSerendib Gems`;
        break;
      case 'refunded':
        emailMessage = `Dear Customer,\n\nYour transaction has been successfully refunded.\n${amountDetails}${gemName ? `\nGem: ${gemName}` : ''}\n\nThe refund should appear in your account within a few business days. Please contact us at support@serendibgems.com if you have any questions.\n\nBest regards,\nSerendib Gems`;
        break;
      default:
        emailMessage = `Dear Customer,\n\nYour transaction status has been updated.\n${amountDetails}${gemName ? `\nGem: ${gemName}` : ''}\n\nPlease contact our support team at support@serendibgems.com if you have any questions.\n\nBest regards,\nSerendib Gems`;
    }

    sendEmail(
      transaction.email,
      'Transaction Status Update',
      emailMessage
    ).catch((error) => {
      console.error('Error sending email:', error);
    });

    res.status(200).json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ 
      message: "Error updating transaction", 
      error: error.message 
    });
  }
};

// Get financial summary
export const getFinancialSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Get all completed sales
    const completedSales = await Finance.find({
      ...dateFilter,
      status: 'completed',
      transactionType: 'sale'
    });
    
    // Get all refunds
    const refunds = await Finance.find({
      ...dateFilter,
      $or: [
        { status: 'refunded' },
        { status: 'completed', transactionType: 'refund' }
      ]
    });
    
    // Calculate totals
    const totalSales = completedSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalRefunds = refunds.reduce((sum, refund) => sum + refund.amount, 0);
    
    // Get payment method breakdown
    const paymentMethodStats = await Finance.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      { $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    res.status(200).json({
      totalSales,
      totalRefunds,
      netRevenue: totalSales - totalRefunds,
      transactionCount: completedSales.length + refunds.length,
      paymentMethods: paymentMethodStats
    });
  } catch (error) {
    console.error('Financial summary error:', error);
    res.status(500).json({
      message: "Error generating financial summary",
      error: error.message
    });
  }
};