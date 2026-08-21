import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import config from '../config.js';

// Clean untrusted file names
const sanitizeFilename = (name) => {
  return name.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
};

const execute = (command, args, timeoutMs = 60000) => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => stdout += data.toString());
    proc.stderr.on('data', (data) => stderr += data.toString());

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
};

export const convertPDF = async (inputPath, outputName) => {
  const outputPath = path.join(config.storage.output, sanitizeFilename(outputName) + '.md');
  // Using pdftotext to extract text
  // The layout option preserves basic layout (some headings, paragraphs)
  await execute('pdftotext', ['-layout', inputPath, outputPath]);
  
  // Basic validation that text was extracted
  const stat = fs.statSync(outputPath);
  if (stat.size < 10) { // Very small file might mean no text layer
    const content = fs.readFileSync(outputPath, 'utf8');
    if (!content.trim()) {
      fs.unlinkSync(outputPath);
      throw new Error('NO TEXT LAYER DETECTED. This PDF appears to be image-based. OCR is not enabled on this resource-constrained installation.');
    }
  }
  
  return outputPath;
};

export const convertDOCX = async (inputPath, outputName) => {
  const outputPath = path.join(config.storage.output, sanitizeFilename(outputName) + '.md');
  await execute('pandoc', [inputPath, '-o', outputPath, '-t', 'gfm']);
  return outputPath;
};

export const convertTXT = async (inputPath, outputName) => {
  const outputPath = path.join(config.storage.output, sanitizeFilename(outputName) + '.md');
  const readStream = fs.createReadStream(inputPath, 'utf8');
  const writeStream = fs.createWriteStream(outputPath, 'utf8');
  
  return new Promise((resolve, reject) => {
    readStream.on('error', reject);
    writeStream.on('error', reject);
    writeStream.on('finish', () => resolve(outputPath));
    
    readStream.pipe(writeStream);
  });
};
