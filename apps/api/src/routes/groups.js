import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const archiver = require('archiver');
import fs from 'fs';
import { createGroup, updateGroup, deleteGroup, listGroups, getGroup, getDocumentsByGroup } from '../database.js';

const router = express.Router();
const isValidId = (id) => /^[a-zA-Z0-9-]+$/.test(id);

router.get('/', (req, res) => {
  try {
    const groups = listGroups();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list groups' });
  }
});

router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') return res.status(400).json({ error: 'Name required' });
    
    const group = { id: uuidv4(), name: name.trim() };
    createGroup(group);
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

router.put('/:id', (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
    const { name } = req.body;
    if (!name || name.trim() === '') return res.status(400).json({ error: 'Name required' });
    
    updateGroup(req.params.id, name.trim());
    res.json(getGroup(req.params.id));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update group' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
    deleteGroup(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

router.get('/:id/download', (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
    
    const group = getGroup(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    
    const docs = getDocumentsByGroup(req.params.id);
    if (docs.length === 0) return res.status(404).json({ error: 'No completed documents in group' });

    res.attachment(`${group.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`);
    
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('error', function(err) {
      console.error('Archiver error:', err);
      if (!res.headersSent) res.status(500).send({ error: err.message });
    });

    // Pipe archive data to the response
    archive.pipe(res);

    // Append files
    docs.forEach(doc => {
      if (doc.output_path && fs.existsSync(doc.output_path)) {
        // Safe filename for zip
        const safeName = doc.filename.replace(/[^a-zA-Z0-9_.-]/g, '_') + '.md';
        archive.file(doc.output_path, { name: safeName });
      }
    });

    archive.finalize();
  } catch (error) {
    console.error('ZIP creation failed:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to create zip' });
  }
});

export default router;
