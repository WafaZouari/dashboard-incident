import { Router } from 'express';
import * as ref from '../controllers/reference.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/locations', ref.getLocations);
router.post('/locations', ref.createLocation);
router.get('/incident-types', ref.getIncidentTypes);
router.post('/incident-types', ref.createIncidentType);
router.get('/incident-types/:id/subcategories', ref.getSubcategories);
router.get('/consequences', ref.getConsequences);
router.get('/users', ref.getUsers);

export default router;
