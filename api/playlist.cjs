// api/playlist.js
const fetch = require('node-fetch');

// Helper: parse M3U content into channel objects (shared between server and tests)
function parseM3UContent(content) {
  if (!content || !content.includes('#EXTM3U')) throw new Error('Invalid M3U format');

  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const channels = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toUpperCase().includes('#EXTINF')) {
      const metadata = lines[i];
      let streamUrl = "";

      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].startsWith('http')) {
          streamUrl = lines[j];
          break;
        }
      }

      if (streamUrl) {
        const nameMatch = metadata.match(/,(.+)$/);
        const name = nameMatch ? nameMatch[1] : 'قناة غير معروفة';

        const groupMatch = metadata.match(/group-title="([^"]*)"/i);
        const group = groupMatch ? groupMatch[1] : 'قنوات عامة';

        const logoMatch = metadata.match(/tvg-logo="([^"]*)"/i);
        const logo = logoMatch ? logoMatch[1] : '';

        const channel = {
          id: `channel_${channels.length}`,
          name,
          logo,
          group,
          url: streamUrl
        };

        channels.push(channel);
      }
    }
  }

  return channels;
}

module.exports = async (req, res) => {
  const { url, category, limit } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist: ${response.status}`);
    }

    const content = await response.text();

    // Use parser helper
    const channels = parseM3UContent(content);

    // Apply filters
    let filteredChannels = channels;

    if (category && category !== 'الكل') {
      filteredChannels = filteredChannels.filter(channel =>
        channel.group.includes(category) || channel.name.includes(category)
      );
    }

    if (limit && !isNaN(parseInt(limit))) {
      filteredChannels = filteredChannels.slice(0, parseInt(limit));
    }

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    res.status(200).json({
      total: channels.length,
      filtered: filteredChannels.length,
      channels: filteredChannels
    });

  } catch (error) {
    console.error('Playlist processing error:', error);
    res.status(500).json({ error: 'Failed to process playlist', details: error.message });
  }
};

// Export parsing helper for unit tests
module.exports.parseM3UContent = parseM3UContent;