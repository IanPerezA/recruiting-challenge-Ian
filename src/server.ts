import { initDb } from './db.js';
import { seedIfEmpty } from './scripts/seed.js';
import { createApp } from './app.js';

await initDb();
await seedIfEmpty();

const PORT = Number(process.env.PORT ?? 3000);

createApp().listen(PORT, () => {
  console.log(`dashboard server listening on http://localhost:${PORT}`);
});
