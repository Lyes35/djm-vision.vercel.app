// test-stream.js - Script de test pour vérifier les streams IPTV (ESM)
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

async function testStream(url) {
  console.log(`Testing stream: ${url}`);

  try {
    // Test du proxy local (configurable via PROXY_URL, défaut: http://localhost:3001/api/)
    const proxyBase = process.env.PROXY_URL || 'http://localhost:3001/api/?url=';
    const proxyUrl = `${proxyBase}${encodeURIComponent(url)}`;
    console.log(`Proxy URL: ${proxyUrl}`);

    const response = await fetch(proxyUrl);

    if (!response.ok) {
      console.error(`❌ Proxy failed: ${response.status} ${response.statusText}`);
      return false;
    }

    const content = await response.text();
    const contentType = response.headers.get('content-type');

    console.log(`✅ Proxy successful`);
    console.log(`Content-Type: ${contentType}`);
    console.log(`Content length: ${content.length} characters`);

    // Vérifier si c'est du HLS valide
    if (content.includes('#EXTM3U')) {
      console.log(`✅ Valid M3U playlist detected`);
      const lines = content.split('\n').filter(line => line.trim());
      console.log(`Lines: ${lines.length}`);

      // Compter les streams
      const streamCount = lines.filter(line => line.startsWith('http')).length;
      console.log(`Streams found: ${streamCount}`);

      return true;
    } else {
      console.log(`⚠️  Content doesn't look like M3U`);
      console.log(`First 200 chars: ${content.substring(0, 200)}...`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting IPTV Stream Tests\n');

  // Test avec un stream public connu
  const testUrls = [
    'https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8',
    // Vous pouvez ajouter vos propres URLs de test ici
  ];

  for (const url of testUrls) {
    console.log(`\n--- Testing: ${url} ---`);
    await testStream(url);
    console.log('');
  }

  console.log('📋 Instructions:');
  console.log('1. Démarrez le serveur local: npm run dev');
  console.log('2. Exécutez ce script: node test-stream.js');
  console.log('3. Vérifiez que les streams se chargent correctement');
  console.log('4. Testez également sur l\'environnement de production Vercel');
}

// Exécuter si appelé directement (pattern ESM)
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  runTests();
}