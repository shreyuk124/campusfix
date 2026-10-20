import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'CampusFix API Server',
      environment: process.env.NODE_ENV || 'development',
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
