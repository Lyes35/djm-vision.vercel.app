// api/analyze.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require('../logger');

module.exports = async (req, res) => {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { channelName } = req.body;

    if (!channelName) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    // Récupération de la clé depuis les variables d'environnement Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      logger.warn("⚠️ La variable d'environnement GEMINI_API_KEY n'est pas définie. Définissez-la dans .env.local ou via vos variables d'environnement pour activer /api/analyze.");
      return res.status(501).json({ error: 'API Key missing. Please set GEMINI_API_KEY in .env.local or the environment.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const result = await model.generateContent({
      contents: `Provide a very brief 1-sentence summary of what this TV channel is about: "${channelName}". Return as plain text in Arabic.`,
    });

    const response = result.response;
    const analysis = response.text();

    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(200).json({ analysis });

  } catch (error) {
    logger.error('AI Analysis error:', error);
    return res.status(500).json({ error: 'Failed to analyze channel' });
  }
};