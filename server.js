import express from 'express';
import dotenv from 'dotenv';
import reunionsRoutes from './routes/reunions.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes principales
app.use('/api/reunions', reunionsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Serveur Scribe démarré sur http://localhost:${PORT}`);
});