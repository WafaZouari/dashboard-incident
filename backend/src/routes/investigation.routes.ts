import { Router } from 'express';
import * as inv from '../controllers/investigation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', inv.getInvestigations);
router.get('/:id', inv.getInvestigationById);
router.get('/incident/:incidentId', inv.getInvestigationsByIncident);
router.post('/', inv.createInvestigation);
router.put('/:id', inv.updateInvestigation);

export default router;
