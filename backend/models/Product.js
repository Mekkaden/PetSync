const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [], // e.g., ["omega-3", "anti-inflammatory", "salmon"]
  },
  allergens_present: {
    type: [String],
    default: [], // e.g., ["chicken"] - so we can filter these out for allergic pets
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
