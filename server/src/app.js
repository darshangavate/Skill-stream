import express from 'express';
import cors from 'cors';
import catalogRoutes from './routes/catalog.routes.js';
import userRoutes from './routes/user.routes.js';
import engineRoutes from './routes/engine.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/catalog', catalogRoutes);
app.use('/api/user', userRoutes);
app.use('/api/engine', engineRoutes);

export default app;