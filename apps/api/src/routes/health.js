import express from 'express';
import os from 'os';
import { execSync } from 'child_process';
import { checkOllama } from '../services/ai.js';

const router = express.Router();

const checkBinary = (name) => {
  try {
    const isWindows = os.platform() === 'win32';
    execSync(isWindows ? `where ${name}` : `which ${name}`, { stdio: 'ignore' });
    return 'READY';
  } catch {
    return 'MISSING';
  }
};

router.get('/', async (req, res) => {
  const ollamaOk = await checkOllama();
  const memUsage = process.memoryUsage();
  
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: {
      system: {
        free: os.freemem(),
        total: os.totalmem(),
        usedPercent: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2)
      },
      application: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed
      }
    },
    capabilities: {
      pdf: checkBinary('pdftotext') === 'READY',
      docx: checkBinary('pandoc') === 'READY',
      ai: ollamaOk
    },
    engines: {
      pdftotext: checkBinary('pdftotext'),
      pandoc: checkBinary('pandoc'),
      ai: ollamaOk ? 'READY' : 'NOT INSTALLED'
    }
  });
});

export default router;
