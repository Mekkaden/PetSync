const express = require('express');
const router = express.Router();
const multer = require('multer');

// Multer Config: Use memory storage so we don't write files to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit to 10MB
  },
});

/**
 * Helper function to extract and parse JSON from the model's response.
 * Handles cases where the model returns markdown code blocks or text wrapping.
 */
function parseJSONResponse(text) {
  const cleanText = text.trim();
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    // Attempt to extract JSON from markdown code blocks
    const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = cleanText.match(markdownRegex);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (innerErr) {
        // Fall through
      }
    }
    
    // If that fails, try finding a raw JSON object string
    const jsonObjectRegex = /(\{[\s\S]*\})/;
    const objectMatch = cleanText.match(jsonObjectRegex);
    if (objectMatch && objectMatch[1]) {
      try {
        return JSON.parse(objectMatch[1].trim());
      } catch (innerErr) {
        // Fall through
      }
    }

    throw new Error(`Invalid JSON format returned from AI model: ${text}`);
  }
}

// @route   POST /api/vision/analyze
// @desc    Analyze pet superficial skin, eye, or dental anomalies via an uploaded image
// @access  Public (or protected if needed, we'll keep it open for easy testing)
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    // 1. Check if file is provided
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded. Please upload an image under the form-data key "image".' });
    }

    // 2. Validate API key presence
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
      console.error('CRITICAL: OPENROUTER_API_KEY is not configured or is using the placeholder.');
      return res.status(500).json({
        error: 'Vision analysis service is not configured. Please set a valid OPENROUTER_API_KEY in the .env file.'
      });
    }

    const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

    // 3. Convert buffer to base64 Data URL
    const base64Data = req.file.buffer.toString('base64');
    let mimeType = req.file.mimetype;
    if (!mimeType || mimeType === 'application/octet-stream' || mimeType === 'image/jpg') {
      mimeType = 'image/jpeg';
    }
    const imageDataUrl = `data:${mimeType};base64,${base64Data}`;

    // 4. Call OpenRouter API
    const systemPrompt = `You are an expert AI veterinary assistant specializing in identifying superficial skin anomalies, eye issues, and dental/mouth abnormalities from pet images.
Your goal is to inspect the uploaded image and output a structured analysis in valid JSON format.

Please output ONLY a JSON object. Do not wrap it in any other text.
The JSON object must contain the following keys:
- "condition": The name of the most likely condition detected (e.g. "Flea Allergy Dermatitis", "Conjunctivitis", "Dental Calculus", "Normal" if the pet looks healthy).
- "confidence": A float score between 0.0 and 1.0 representing your prediction confidence.
- "details": A brief description of the visual signs observed (redness, lesions, hair loss, plaque, etc.) and simple advice on what symptoms the pet owner should monitor.`;

    const openRouterPayload = {
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: systemPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl
              }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000
    };


    console.log(`Sending image to OpenRouter using model: ${model}...`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/RockeyyAbraham/PetSync',
        'X-Title': 'PetSync AI Veterinary Scanner'
      },
      body: JSON.stringify(openRouterPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error: ${response.status} - ${errorText}`);
      return res.status(502).json({
        error: 'Failed to communicate with the external vision model service.',
        details: errorText
      });
    }

    const data = await response.json();
    console.log('Received response from OpenRouter');

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No completion choices returned from OpenRouter.');
    }

    const contentText = data.choices[0].message.content;
    const parsedResult = parseJSONResponse(contentText);

    // Standardize confidence to a float number
    if (parsedResult && parsedResult.hasOwnProperty('confidence')) {
      const num = parseFloat(parsedResult.confidence);
      if (!isNaN(num)) {
        parsedResult.confidence = num;
      }
    }

    res.json(parsedResult);


  } catch (error) {
    console.error('Error in /api/vision/analyze:', error);
    res.status(500).json({
      error: 'An unexpected error occurred during image analysis.',
      details: error.message
    });
  }
});

module.exports = router;
