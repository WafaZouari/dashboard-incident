import { Router } from 'express';
import * as ai from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/analyze-incident/:id', ai.analyzeIncident);
router.post('/create-investigation/:id', ai.createAIInvestigation);
router.get('/insights', ai.getAIInsights);
router.post('/test', ai.testAI);

export default router;
