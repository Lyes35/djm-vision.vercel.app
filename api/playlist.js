// api/playlist.js
const fetch = require('node-fetch');
const logger = require('../logger.cjs');

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
    if (!content.includes('#EXTM3U')) {
      throw new Error('Invalid M3U format');
    }

    // Parser le M3U
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const channels = [];
    let currentChannel = null;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toUpperCase().includes('#EXTINF')) {
        const metadata = lines[i];
        let streamUrl = "";

        // Chercher l'URL dans les lignes suivantes
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          if (lines[j].startsWith('http')) {
            streamUrl = lines[j];
            break;
          }
        }

        if (streamUrl) {
          // Extraire les informations du canal
          const nameMatch = metadata.match(/,(.+)$/);
          const name = nameMatch ? nameMatch[1] : 'Unknown';

          const groupMatch = metadata.match(/group-title="([^"]*)"/i);
          const group = groupMatch ? groupMatch[1] : 'General';

          const logoMatch = metadata.match(/tvg-logo="([^"]*)"/i);
          const logo = logoMatch ? logoMatch[1] : '';

          currentChannel = {
            id: `channel_${channels.length}`,
            name: name,
            logo: logo,
            group: group,
            url: streamUrl
          };

          channels.push(currentChannel);
        }
      }
    }

    // Appliquer les filtres
    let filteredChannels = channels;

    if (category && category !== 'الكل') {
      filteredChannels = filteredChannels.filter(channel =>
        channel.group.includes(category) || channel.name.includes(category)
      );
    }

    if (limit && !isNaN(parseInt(limit))) {
      filteredChannels = filteredChannels.slice(0, parseInt(limit));
    }

    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    res.status(200).json({
      total: channels.length,
      filtered: filteredChannels.length,
      channels: filteredChannels
    });

  } catch (error) {
    logger.error('Playlist processing error:', error);
    res.status(500).json({ error: 'Failed to process playlist', details: error.message });
  }
};