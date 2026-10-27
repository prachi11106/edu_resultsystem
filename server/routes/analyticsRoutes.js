import express from 'express';
import { getDashboardAnalytics, getComparativeAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/dashboard', getDashboardAnalytics);
router.get('/comparative', getComparativeAnalytics);

export default router;
