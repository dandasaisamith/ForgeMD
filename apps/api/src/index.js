import express from 'express';
import cors from 'cors';
import path from 'path';
import config, { isProd } from './config.js';
import convertRouter from './routes/convert.js';
import documentsRouter from './routes/documents.js';
import healthRouter from './routes/health.js';
import groupsRouter from './routes/groups.js';

const app = express();

app.use(cors());

app.use('/api/convert', convertRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/health', healthRouter);
app.use('/api/groups', groupsRouter);

if (isProd) {
  // In production, serve the built Vite app
  const webBuildPath = path.join(process.cwd(), '../web/dist');
  app.use(express.static(webBuildPath));
  
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(webBuildPath, 'index.html'));
    }
  });
}

const server = app.listen(config.port, config.host, () => {
  console.log(`ForgeMD API listening on ${config.host}:${config.port}`);
  console.log(`Storage root: ${config.storage.incoming}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    import('./database.js').then(dbModule => {
      dbModule.default.close();
      console.log('Database connection closed.');
      process.exit(0);
    });
  });
});
