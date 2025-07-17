const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function categorizeComplaint(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro-latest" });

    const prompt = `Categorize the following complaint into one of these categories: 
    Mess Food, Maintenance, Electrical, Plumbing, , WiFi, Noise or other .\n\nComplaint: "${text}"\n\nOnly return the category name.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const category = response.text().trim();

    return category;
  } catch (error) {
    console.error("❌ Error categorizing complaint:", error.message);
    return "Other"; // Fallback category
  }
}

module.exports = { categorizeComplaint };
