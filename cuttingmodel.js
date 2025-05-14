import mongoose from 'mongoose';

const gemCuttingRequestSchema = new mongoose.Schema({
  gemstoneType: {
    type: String,
    required: true,
    enum: [
      'Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Amethyst',
      'Aquamarine', 'Topaz', 'Opal', 'Garnet', 'Peridot',
      'Tanzanite', 'Tourmaline', 'Citrine', 'Morganite', 'Other'
    ]
  },
  roughStoneWeight: {
    type: Number,
    required: true,
    min: 0.01
  },
  shapeOfRoughStone: {
    type: String,
    required: true,
    enum: [
      'Octahedron', 'Cube', 'Dodecahedron', 'Irregular', 'Tabular',
      'Prismatic', 'Rounded', 'Elongated', 'Flat', 'Other'
    ]
  },
  inclusionLocation: {
    type: String,
    required: true
  },
  desiredShape: {
    type: String,
    required: true,
    enum: [
      'Round', 'Princess', 'Cushion', 'Emerald', 'Oval',
      'Pear', 'Marquise', 'Asscher', 'Radiant', 'Heart',
      'Trillion', 'Baguette', 'Briolette', 'Rose Cut', 'Other'
    ]
  },
  expectedWeightAfterCutting: {
    type: Number,
    min: 0.01
  },
  cuttingMethod: {
    type: String,
    required: true,
    enum: [
      'Traditional', 'Precision', 'Laser', 'Ultrasonic', 'Water Jet',
      'Hand Cutting', 'Automated', 'Hybrid', 'Other'
    ]
  },
  brilliancePriority: {
    type: String,
    required: true,
    enum: ['weight retention', 'brilliance maximization']
  },
  finishLevel: {
    type: String,
    required: true,
    enum: ['rough', 'medium', 'high polish']
  },
  gemstoneColorQuality: {
    type: String
  },
  additionalNotes: {
    type: String
  },
  cutter: {
    type: String,
    required: true,
    enum: [
      'John Diamond', 'Maria Gemstone', 'Robert Crystal', 'Sarah Facet',
      'David Brilliance', 'Lisa Precision', 'Michael Cutter', 'Custom'
    ]
  },
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  contactNumber: {
    type: String
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'in_progress', 'completed', 'cancelled']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('GemCuttingRequest', gemCuttingRequestSchema);