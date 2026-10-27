import express from 'express';
import {
  getResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult,
  analyzePerformance,
} from '../controllers/resultController.js';

const router = express.Router();

router.route('/')
  .get(getResults)
  .post(createResult);

router.post('/analyze', analyzePerformance);

router.route('/:id')
  .get(getResultById)
  .put(updateResult)
  .delete(deleteResult);

router.post('/:id/analyze', analyzePerformance);

export default router;
