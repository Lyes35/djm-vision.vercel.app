// test-stream.js - Script de test pour vérifier les streams IPTV (ESM)
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const logger = require('./logger.cjs');

async function testStream(url) {
  logger.info(`Testing stream: ${url}`);

  try {
    // Test du proxy local (configurable via PROXY_PORT, default 3001)
    const proxyPort = process.env.PROXY_PORT || 3001;
    const proxyUrl = `http://localhost:${proxyPort}/api/?url=${encodeURIComponent(url)}`;
    logger.debug(`Proxy URL: ${proxyUrl}`);

    const response = await fetch(proxyUrl);

    if (!response.ok) {
      logger.error(`❌ Proxy failed: ${response.status} ${response.statusText}`);
      return false;
    }

    const content = await response.text();
    const contentType = response.headers.get('content-type');

    logger.info(`✅ Proxy successful`);
    logger.debug(`Content-Type: ${contentType}`);
    logger.debug(`Content length: ${content.length} characters`);

    // Vérifier si c'est du HLS valide
    if (content.includes('#EXTM3U')) {
      logger.info(`✅ Valid M3U playlist detected`);
      const lines = content.split('\n').filter(line => line.trim());
      logger.debug(`Lines: ${lines.length}`);

      // Compter les streams — considérer aussi les URI relatives en les résolvant
      const base = url.substring(0, url.lastIndexOf('/') + 1);
      let streamCount = 0;
      for (const line of lines) {
        if (line.startsWith('http')) {
          streamCount++;
        } else if (!line.startsWith('#')) {
          // URI relative, on la résout et on la compte
          try {
            const resolved = new URL(line, base).href;
            if (resolved.startsWith('http')) streamCount++;
          } catch {
            // ignore
          }
        }
      }
      logger.info(`Streams found: ${streamCount}`);

      return true;
    } else {
      logger.warn(`⚠️  Content doesn't look like M3U`);
      logger.debug(`First 200 chars: ${content.substring(0, 200)}...`);
      return false;
    }

  } catch (error) {
    logger.error(`❌ Test failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  logger.info('🚀 Starting IPTV Stream Tests\n');

  // Test avec un stream HLS public de référence
  const testUrls = [
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    'https://raw.githubusercontent.com/zinzineddine15-arch/djm-vision.vercel.app/feat/gemini-env-warning/tests/absolute-segments.m3u8',
    // Vous pouvez ajouter vos propres URLs de test ici
  ];

  const results = [];

  for (const url of testUrls) {
    logger.info(`\n--- Testing: ${url} ---`);
    const ok = await testStream(url);
    results.push({ url, ok });
    logger.debug('');
  }

  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) {
    logger.error(`❌ ${failed.length} stream test(s) failed:`);
    failed.forEach(f => logger.error(` - ${f.url}`));
    // Exit with non-zero code so CI fails
    process.exit(1);
  }

  logger.info('✅ All stream tests passed successfully');
  process.exit(0);
}

// Exécuter si appelé directement (pattern ESM)
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  runTests();
}