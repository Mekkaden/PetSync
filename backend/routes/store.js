const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Pet = require('../models/Pet');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/store/products
// @desc    Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/store/recommend
// @desc    Personalized Nutrition AI (The Logic Engine)
//          Takes a pet ID and returns filtered products based on allergies and conditions
router.post('/recommend', protect, async (req, res) => {
  try {
    const { petId } = req.body;
    
    // 1. Get the Pet's active profile
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // 2. Fetch all products
    let products = await Product.find({});

    // 3. THE LOGIC ENGINE (Algorithmic filtering)
    
    // a) STRICT FILTERING: Remove any product containing pet's allergens
    if (pet.allergies && pet.allergies.length > 0) {
      products = products.filter(product => {
        // If product has allergens_present that intersect with pet.allergies, filter it out
        const hasAllergen = product.allergens_present.some(allergen => 
          pet.allergies.includes(allergen.toLowerCase())
        );
        return !hasAllergen; // keep products that DO NOT have the allergen
      });
    }

    // b) PROMOTING / MATCHING: Highlight products based on AI Diagnostic conditions
    // If a pet has "ear_mites" or "skin_rash", we want to promote "omega-3" products.
    // If a pet has "leg_strain", we promote "joint-care".
    
    const conditions = pet.conditions || [];
    
    // Sort logic to bubble up recommended products
    products.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Check product A tags against conditions
      if (conditions.includes('ear_mites') || conditions.includes('skin_rash')) {
        if (a.tags.includes('omega-3') || a.tags.includes('anti-inflammatory')) scoreA += 10;
        if (b.tags.includes('omega-3') || b.tags.includes('anti-inflammatory')) scoreB += 10;
      }
      
      if (conditions.includes('leg_strain') || conditions.includes('limp')) {
        if (a.tags.includes('joint-care')) scoreA += 10;
        if (b.tags.includes('joint-care')) scoreB += 10;
      }

      // Sort descending (highest score first)
      return scoreB - scoreA;
    });

    res.json({
      success: true,
      pet: pet.name,
      recommendations: products
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/store/seed
// @desc    Seed mock products for testing
router.post('/seed', async (req, res) => {
  try {
    await Product.deleteMany(); // clear existing
    const mockProducts = [
      {
        name: "Premium Salmon Kibble",
        description: "High quality anti-inflammatory salmon food.",
        price: 45.99,
        imageUrl: "https://images.unsplash.com/photo-1589924691995-400dc9ce8071?w=500&q=80",
        tags: ["omega-3", "anti-inflammatory", "salmon"],
        allergens_present: ["fish"]
      },
      {
        name: "Chicken & Rice Bowl",
        description: "Standard chicken diet.",
        price: 30.50,
        imageUrl: "https://images.unsplash.com/photo-1585846416120-3a73df0af869?w=500&q=80",
        tags: ["chicken", "standard"],
        allergens_present: ["chicken", "grain"]
      },
      {
        name: "Glucosamine Joint Chews",
        description: "Supports healthy joints and mobility.",
        price: 25.00,
        imageUrl: "https://images.unsplash.com/photo-1623366302587-bca23219eeab?w=500&q=80",
        tags: ["joint-care", "supplements"],
        allergens_present: ["beef"]
      }
    ];

    const created = await Product.insertMany(mockProducts);
    res.json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
