import express from 'express';
import { listDocuments, getDocument } from '../database.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const isValidId = (id) => /^[a-zA-Z0-9-]+$/.test(id);

router.get('/', (req, res) => {
  try {
    const docs = listDocuments();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
    const doc = getDocument(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
    const { filename, group_id } = req.body;
    const doc = getDocument(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    
    const updates = {};
    if (filename !== undefined) updates.filename = filename;
    if (group_id !== undefined) updates.group_id = group_id === '' ? null : group_id;
    
    if (Object.keys(updates).length > 0) {
      updateDocument(req.params.id, updates);
    }
    
    res.json(getDocument(req.params.id));
  } catch (error) {
    console.error('Update doc error:', error);
    res.status(500).json({ error: 'Update failed' });
  }
});

router.get('/:id/download', (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
    const doc = getDocument(req.params.id);
    if (!doc || !doc.output_path || !fs.existsSync(doc.output_path)) {
      return res.status(404).json({ error: 'File not found or not processed yet' });
    }
    
    res.download(doc.output_path, `${path.parse(doc.filename).name}.md`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/content', (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
    const doc = getDocument(req.params.id);
    if (!doc || !doc.output_path || !fs.existsSync(doc.output_path)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // For large files, stream might be better but for previewing a portion we can send string.
    // For now we just send the file content. 
    res.sendFile(doc.output_path);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
