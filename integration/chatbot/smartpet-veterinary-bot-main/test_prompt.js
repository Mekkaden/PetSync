require('dotenv').config();
const buildPrompt = require('./prompt');
const llmService = require('./services/llmService');

const context = "Name: JACKY\nBreed: Golden Retriever \nAge: 1.5\nWeight: Unknown\nAllergies: grapes, pork\nMedical History: Leg surgery. Last vet checkup: January 2024\nFood: Drools Adult\nFeeding Schedule: Twice a day\nHygiene: Bath every alternative days , brush every day";
const userMessage = "jacky's eyes are red";

async function test() {
  const finalPrompt = buildPrompt(context, userMessage, []);
  console.log("PROMPT:", finalPrompt);
  const responseText = await llmService.generateResponse(finalPrompt);
  console.log("RESPONSE:", responseText);
}
test();
