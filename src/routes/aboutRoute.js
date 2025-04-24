// src/routes/aboutRoute.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.get('/about', (req, res) => {
  const filePath = path.join(__dirname, '..', 'about.txt');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('❌ Failed to read about.txt:', err);
      return res.status(500).send('❌ Error loading About content');
    }
    res.type('text/plain').send(data);
  });
});

export default router;
