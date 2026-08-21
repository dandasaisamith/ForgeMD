import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { addDocument, updateDocument } from '../database.js';
import { convertPDF, convertDOCX, convertTXT } from '../services/converter.js';
import config from '../config.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.storage.incoming),
  filename: (req, file, cb) => {
    const id = crypto.randomUUID();
    const ext = path.extname(file.originalname);
    cb(null, `${id}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 } // 1GB limit
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const id = path.parse(req.file.filename).name;
    const type = req.file.mimetype;
    
    addDocument({
      id,
      filename: req.file.originalname,
      type,
      size: req.file.size,
      status: 'CONVERTING'
    });
    
    res.json({ id, status: 'CONVERTING' });

    // Process asynchronously to avoid blocking the response
    const startTime = Date.now();
    let outputPath = null;

    try {
      const ext = path.extname(req.file.originalname).toLowerCase();
      
      if (ext === '.pdf') {
        outputPath = await convertPDF(req.file.path, id);
      } else if (ext === '.docx') {
        outputPath = await convertDOCX(req.file.path, id);
      } else if (ext === '.txt' || type.startsWith('text/')) {
        outputPath = await convertTXT(req.file.path, id);
      } else {
        throw new Error('Unsupported file type');
      }

      updateDocument(id, {
        status: 'COMPLETED',
        output_path: outputPath,
        conversion_time: Date.now() - startTime
      });
      
    } catch (err) {
      updateDocument(id, {
        status: 'ERROR',
        error: err.message
      });
    } finally {
      // Clean up incoming file to save space
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// For pasted text
router.post('/text', express.json({ limit: '50mb' }), async (req, res) => {
  try {
    const { text, filename } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });
    
    const id = crypto.randomUUID();
    const name = filename || 'Pasted_Text.txt';
    const inputPath = path.join(config.storage.incoming, `${id}.txt`);
    
    fs.writeFileSync(inputPath, text);
    
    addDocument({
      id,
      filename: name,
      type: 'text/plain',
      size: Buffer.byteLength(text, 'utf8'),
      status: 'CONVERTING'
    });
    
    res.json({ id, status: 'CONVERTING' });

    const startTime = Date.now();
    try {
      const outputPath = await convertTXT(inputPath, id);
      updateDocument(id, {
        status: 'COMPLETED',
        output_path: outputPath,
        conversion_time: Date.now() - startTime
      });
    } catch (err) {
      updateDocument(id, {
        status: 'ERROR',
        error: err.message
      });
    } finally {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    }
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
