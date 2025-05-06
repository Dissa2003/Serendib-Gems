import mongoose from "mongoose";

const financeSchema = new mongoose.Schema({
  transactionType: {
    type: String,
    required: true,
    enum: ['sale', 'refund'],
    default: 'sale'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit-card', 'paypal', 'google-pay']
  },
  description: {
    type: String,
    required: true
  },
  relatedGem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gem',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  paymentDetails: {
    cardNumber: String,
    cardHolder: String,
    cardLastFour: String,
    paypalEmail: String,
    expiryDate: String
  },
  metadata: {
    quantity: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Finance', financeSchema);