const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId, //a string that the mongo develops automatically for the owner
    ref: 'User', //a string that tells the database that this is a reference to the User model
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
    type: [String], //an array of string only allowed here
    default: [],//Put an empty array if user does nothing
    // e.g., ["chicken", "beef"] 
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
}, { timestamps: true }); //timestamps , createdat and updated at automatically set by mongo

module.exports = mongoose.model('Pet', PetSchema);
