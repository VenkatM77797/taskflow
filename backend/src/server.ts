import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import labelRoutes from './routes/label.routes.js';
import taskRoutes from './routes/task.routes.js';
import statsRoutes from './routes/stats.routes.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
