import config from '../config.js';

export const checkOllama = async () => {
  try {
    // using dynamic import for fetch if not available natively (node 16-), but node 18+ has it.
    // assuming node 18+ for modern Vite/React
    const res = await fetch(`${config.ai.ollamaUrl}/api/version`);
    return res.ok;
  } catch {
    return false;
  }
};
