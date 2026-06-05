import { createServer } from './server.js';
import { setupRoutes } from './routes/index.js';

const PORT = Number(process.env.PORT) || 3100;

const app = createServer();
setupRoutes(app);

app.listen(PORT, () => {
  console.log(`[node-bff-practices] listening on http://127.0.0.1:${PORT}`);
  console.log('[node-bff-practices] try: curl http://127.0.0.1:3100/api/echo');
});
