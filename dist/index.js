import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { initDB } from './db/client.js';
import authRoutes from './routes/index.js';
const app = express();
const startServer = async () => {
    await initDB();
    console.log('Lowdb is up and running');
    app.use(express.json());
    // Routes
    app.use('/', authRoutes);
    app.listen(process.env.PORT, () => {
        console.log(`Server running at http://${process.env.SERVER_HOSTNAME}:${process.env.PORT}`);
    });
};
startServer();
