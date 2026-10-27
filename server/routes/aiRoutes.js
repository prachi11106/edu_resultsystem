import express from 'express';
import { generateAIAnalysis } from '../services/aiService.js';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { studentName, percentage, subjects, grade, resultStatus } = req.body;

    if (!subjects || !Array.isArray(subjects)) {
      return res.status(400).json({ success: false, message: 'Subjects array is required for AI evaluation' });
    }

    const analysis = await generateAIAnalysis({
      studentName: studentName || 'Student',
      percentage: Number(percentage) || 0,
      subjects,
      grade: grade || 'N/A',
      resultStatus: resultStatus || 'PASS',
    });

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('[AI Route Error]', error);
    res.status(500).json({ success: false, message: 'Failed to generate AI performance feedback' });
  }
});

export default router;
