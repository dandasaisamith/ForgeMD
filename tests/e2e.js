import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_URL = 'http://127.0.0.1:3000';

async function runTests() {
  console.log('--- ForgeMD E2E Verification ---');
  
  // 1. Healthcheck
  console.log('[1/4] Checking Health...');
  const res = await fetch(`${SERVER_URL}/api/health`);
  const health = await res.json();
  if (health.status !== 'ok') throw new Error('Healthcheck failed');
  console.log('Healthcheck passed:', health.capabilities);

  // 2. Upload text
  console.log('[2/4] Testing Text Conversion...');
  const textRes = await fetch(`${SERVER_URL}/api/convert/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Hello E2E', filename: 'test.txt' })
  });
  const textData = await textRes.json();
  console.log('Converted text, ID:', textData.id);

  // Poll for completion
  let attempts = 0;
  while(attempts < 10) {
    const docRes = await fetch(`${SERVER_URL}/api/documents/${textData.id}`);
    const docData = await docRes.json();
    if (docData.status === 'COMPLETED') {
      console.log('Text conversion COMPLETED!');
      break;
    }
    await new Promise(r => setTimeout(r, 1000));
    attempts++;
  }

  // 3. Document listing
  console.log('[3/4] Testing Document Listing...');
  const listRes = await fetch(`${SERVER_URL}/api/documents`);
  const listData = await listRes.json();
  if (!Array.isArray(listData) || listData.length === 0) {
    throw new Error('List documents failed');
  }
  console.log(`Found ${listData.length} documents.`);

  // 4. Download document
  console.log('[4/4] Testing Download...');
  const downloadRes = await fetch(`${SERVER_URL}/api/documents/${textData.id}/download`);
  if (!downloadRes.ok) throw new Error('Download failed');
  const content = await downloadRes.text();
  if (!content.includes('Hello E2E')) throw new Error('Downloaded content mismatched');
  console.log('Download verified correctly.');

  console.log('--- ALL E2E TESTS PASSED ---');
}

runTests().catch(console.error);
