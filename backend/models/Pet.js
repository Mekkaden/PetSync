const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  breed: {
    type: String,
    required: true,
  },
  allergies: {
    type: [String],
    default: [], // e.g., ["chicken", "beef"]
  },
  imageUrl: {
    type: String,
    default: "", // Default empty string means we'll show a fallback on the frontend
  },
  // We can optionally store diagnosed conditions here later
  conditions: {
    type: [String],
    default: [], // e.g., ["ear_mites", "leg_strain"]
  }
}, { timestamps: true });

module.exports = mongoose.model('Pet', PetSchema);
