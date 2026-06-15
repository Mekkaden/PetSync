const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const { protect } = require('../middleware/authMiddleware');
const http = require('http');

/**
 * Sends pet profile data to Rocky's AI chatbot server (port 5000) for ingestion into Supabase.
 * This is fire-and-forget — we don't block the response waiting for it.
 * If the chatbot server is down, we just log a warning and move on.
 */
function ingestToAI(pet) {
  try {
    const payload = JSON.stringify({
      petId: pet._id.toString(),
      name: pet.name || '',
      breed: pet.breed || '',
      age: pet.age ? pet.age.toString() : '',
      weight: '',
      allergies: Array.isArray(pet.allergies) ? pet.allergies.join(', ') : (pet.allergies || 'None'),
      medicalHistory: Array.isArray(pet.conditions) ? pet.conditions.join(', ') : (pet.conditions || 'None'),
      food: 'Standard pet food',
      feedingSchedule: 'Twice daily',
      hygiene: 'Regular grooming',
    });

    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/ingest',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      console.log('[AI Ingest] Status:', res.statusCode, 'for pet:', pet.name);
    });

    req.on('error', (err) => {
      console.warn('[AI Ingest] Chatbot server unreachable. Is it running on port 5000?', err.message);
    });

    req.write(payload);
    req.end();
  } catch (err) {
    console.warn('[AI Ingest] Failed to send pet data to AI server:', err.message);
  }
}

const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename(req, file, cb) {
    cb(null, `pet-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// @route   POST /api/pets
// @desc    Create a new pet profile
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { name, age, breed, allergies } = req.body;
    let imageUrl = '';

    // If a file was uploaded, construct the local URL.
    if (req.file) {
      // Get the host and protocol to construct the full URL, or just use the relative path
      // Using relative path '/uploads/filename' is easier and the frontend can prepend the API base URL.
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      // Fallback to text URL if provided
      imageUrl = req.body.imageUrl;
    }

    const pet = await Pet.create({
      owner: req.user._id,
      name,
      age,
      breed,
      allergies: allergies ? (typeof allergies === 'string' ? allergies.split(',').map(a => a.trim()) : allergies) : [],
      imageUrl,
    });

    // Fire-and-forget: sync pet to Rocky's AI chatbot (Supabase vector store)
    ingestToAI(pet);

    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/pets
// @desc    Get all pets for the logged in user
router.get('/', protect, async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user._id });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/pets/:id
// @desc    Update a pet profile (e.g., adding a condition from scanner)
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Make sure user owns the pet
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updateData = { ...req.body };
    if (updateData.allergies && typeof updateData.allergies === 'string') {
      updateData.allergies = updateData.allergies.split(',').map(a => a.trim());
    }

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: 'after',
    });

    // Fire-and-forget: sync updated pet to Rocky's AI chatbot (Supabase vector store)
    ingestToAI(updatedPet);

    res.json(updatedPet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/pets/:id
// @desc    Delete a pet profile
router.delete('/:id', protect, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await pet.deleteOne();
    res.json({ message: 'Pet removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
