/**
 * Builder Hub 서버 — public 폴더를 그대로 서빙한다 (빌드 단계 없음).
 *
 *   npm start   →  http://localhost:3020
 */
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3020;

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
