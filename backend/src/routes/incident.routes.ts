import { Router } from 'express';
import * as incident from '../controllers/incident.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', incident.getIncidents);
router.get('/stats', incident.getIncidentStats);
router.get('/export', incident.exportIncidents);
router.get('/:id', incident.getIncidentById);
router.post('/', incident.createIncident);
router.put('/:id', incident.updateIncident);
router.delete('/:id', incident.deleteIncident);

export default router;
