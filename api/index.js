// المسار: /api/index.js
// const fetch = require('node-fetch'); // Removed, using native fetch
const logger = require('../logger');

module.exports = async (req, res) => {
  // استخراج الرابط من العنوان ?url=...
  const { url } = req.query;

  // التحقق من وجود رابط
  if (!url) {
    return res.status(400).json({ error: 'Please provide a URL parameter (?url=https://...)' });
  }

  try {
    // جلب الرابط المطلوب
    const response = await fetch(url);
    
    // قراءة البيانات (محتوى ملف m3u8)
    const data = await response.text();

    // ---------------------------------------------------
    // أهم جزء: إعدادات CORS (السماح لبلوجر بالوصول)
    // ---------------------------------------------------
    res.setHeader('Access-Control-Allow-Origin', '*'); // السماح للكل
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // ضبط نوع المحتوى ليفهمه مشغل الفيديو
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

    // إرسال البيانات للمشغل
    res.status(200).send(data);

  } catch (error) {
    logger.error('Proxy fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch the stream', details: error.message });
  }
};
