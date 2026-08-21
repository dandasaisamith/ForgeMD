import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const isProd = process.env.NODE_ENV === 'production';
const rootStoragePath = process.env.STORAGE_PATH || path.join(__dirname, '../../../../storage');

const config = {
  host: process.env.HOST || '127.0.0.1',
  port: process.env.PORT || 3000,
  storage: {
    incoming: process.env.STORAGE_UPLOADS || path.join(rootStoragePath, 'incoming'),
    output: process.env.STORAGE_OUTPUTS || path.join(rootStoragePath, 'output'),
    cache: process.env.STORAGE_TMP || path.join(rootStoragePath, 'cache'),
    dbPath: process.env.STORAGE_DATA ? path.join(process.env.STORAGE_DATA, 'forgemd.sqlite') : path.join(rootStoragePath, 'forgemd.sqlite')
  },
  ai: {
    ollamaUrl: process.env.OLLAMA_URL || 'http://127.0.0.1:11434'
  }
};

// Initialize directories
ensureDir(config.storage.incoming);
ensureDir(config.storage.output);
ensureDir(config.storage.cache);

export default config;
