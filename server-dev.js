#!/usr/bin/env node
import express from 'express';
import apiHandler from './api/index.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const logger = require('./logger.cjs');

const app = express();
app.use(express.json());

// CORS preflight
app.options('/api', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

// Mount the existing serverless handler (now ESM export default)
app.get('/api', (req, res) => apiHandler(req, res));

const port = process.env.PORT || 3001;
app.listen(port, () => logger.info(`Proxy server listening on http://localhost:${port}/api`));
