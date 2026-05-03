import { Router } from 'express';
import * as analytics from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', analytics.getDashboardStats);
router.get('/trends', analytics.getTrends);
router.get('/by-type', analytics.getByType);
router.get('/by-location', analytics.getByLocation);
router.get('/by-severity', analytics.getBySeverity);
router.get('/by-pse-tier', analytics.getByPseTier);
router.get('/by-asset-integrity', analytics.getByAssetIntegrity);
router.get('/root-causes', analytics.getRootCauses);

export default router;
