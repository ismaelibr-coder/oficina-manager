import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

import { router } from './routes';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Rotas da API
app.use('/api', router);

// Rota de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        message: 'API Sistema de Gestão de Oficina',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            customers: '/api/customers',
            vehicles: '/api/vehicles',
            boxes: '/api/boxes',
            appointments: '/api/appointments',
            products: '/api/products',
            services: '/api/services',
            checklists: '/api/checklists',
            serviceOrders: '/api/service-orders'
        }
    });
});

// Tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            status: err.status || 500
        }
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

export default app;
