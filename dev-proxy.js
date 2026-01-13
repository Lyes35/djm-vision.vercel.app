import express from 'express';

const app = express();
const port = process.env.PROXY_PORT || 3001;

// Simple logger for debug
app.use((req, _res, next) => {
  console.log(`[proxy] ${req.method} ${req.url}`);
  next();
});

// Health endpoint
app.get('/', (_req, res) => {
  res.set('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ status: 'ok', routes: ['/api?url=...'] }));
});

// Handle CORS preflight for /api
app.options('/api', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

app.get('/api', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    // Return a helpful, human-readable message with usage example
    res.set('Content-Type', 'application/json');
    return res.status(400).send(JSON.stringify({
      error: 'Missing URL parameter',
      message: 'Please provide a valid URL parameter. Example: /api?url=https://example.com/playlist.m3u8',
      usage: '/api?url=<encoded-url>'
    }));
  }

  try {
    // ensure url is a string
    const target = Array.isArray(url) ? url[0] : String(url);

    // Basic validation to avoid obvious mistakes
    if (!/^https?:\/\//i.test(target)) {
      return res.status(400).json({ error: 'Invalid URL', message: 'URL must start with http:// or https://' });
    }

    const response = await fetch(target);

    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Read as text to ease debugging; binary handling can be added if needed
    const text = await response.text();

    // CORS + content-type
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Content-Type', contentType);

    res.status(200).send(text);
  } catch (error) {
    console.error('Proxy fetch error:', error);
    res.status(502).json({ error: 'Failed to fetch the stream', details: String(error.message || error) });
  }
});

app.listen(port, () => console.log(`Dev proxy listening on http://localhost:${port}`));
