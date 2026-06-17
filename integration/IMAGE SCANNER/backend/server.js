// Polyfill global crypto for Node.js versions < 19 where globalThis.crypto is undefined
if (!globalThis.crypto) {
  try {
    globalThis.crypto = require('crypto').webcrypto;
  } catch (err) {
    console.error("Failed to polyfill globalThis.crypto:", err);
  }
}

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');


// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public folder
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Basic Route for testing
app.get('/', (req, res) => {
  res.json({ message: 'SmartPet AI Engine Room (Richard\'s Backend) is running...' });
});

// We will mount our routes here shortly...
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/store', require('./routes/store'));
app.use('/api/vision', require('./routes/vision'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
