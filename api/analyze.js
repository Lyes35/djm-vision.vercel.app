// api/analyze.js
const { GoogleGenerativeAI } = require("@google/genai");

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
      console.error('Missing GEMINI_API_KEY - set it in Vercel Environment Variables or .env.local for local dev');
      return res.status(500).json({ error: 'GEMINI_API_KEY missing. Set GEMINI_API_KEY in environment or .env.local' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const result = await model.generateContent({
      contents: `أعطِ جملة واحدة قصيرة باللغة العربية تصف محتوى قناة التلفزيون هذه: "${channelName}". أعد النص باللغة العربية فقط.`,
    });

    const response = result.response;
    const analysis = await response.text();

    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(200).json({ analysis });

  } catch (error) {
    console.error('AI Analysis error:', error);
    return res.status(500).json({ error: 'Failed to analyze channel' });
  }
};