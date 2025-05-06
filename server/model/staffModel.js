import mongoose from 'mongoose';

// Define the staff schema
const staffSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: function () { return !this.fullName; },
  },
  lastName: {
    type: String,
    required: false,
  },
  fullName: {
    type: String,
    required: function () { return !this.firstName; },
  },
  username: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: function () { return this.fullName; },
    enum: ['Inventory Manager', 'Gem Cutter', 'Financial Manager', 'Delivery Manager', 'Employee'],
    default: null,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
    validate: {
      validator: function () {
        return this.password === this.confirmPassword;
      },
      message: 'Passwords do not match',
    },
  },
  profilePic: {
    type: String,
  },
  documents: [{
    name: { type: String, required: true },
    path: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'pdf', 'image'
  }],
}, { timestamps: true });

// Clear existing model to avoid schema conflicts
if (mongoose.models.Staff) {
  delete mongoose.models.Staff;
}

// Prevent model overwrite by checking if the model is already compiled
const Staff = mongoose.model('Staff', staffSchema);

export default Staff;