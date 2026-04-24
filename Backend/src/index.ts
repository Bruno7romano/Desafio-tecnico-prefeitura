import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { runSeed } from './db/seed';
import authRouter from './routes/auth';
import childrenRouter from './routes/children';
import summaryRouter from './routes/summary';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);
app.use('/children', childrenRouter);
app.use('/summary', summaryRouter);

// Popula o banco na inicialização
runSeed();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});