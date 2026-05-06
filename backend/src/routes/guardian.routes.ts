import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as guardian from '../controllers/guardian.controller';
import * as shift from '../controllers/guardian-shift.controller';
import * as assignment from '../controllers/guardian-assignment.controller';

const router = Router();

// Secure all guardian routes
router.use(authenticate);

// --- SHIFT TYPES ---
router.get('/shifts', shift.getShifts);
router.post('/shifts', shift.createShift);
router.put('/shifts/:id', shift.updateShift);
router.delete('/shifts/:id', shift.deleteShift);

// --- ASSIGNMENTS ---
router.get('/assignments', assignment.getAssignments);
router.get('/assignments/calendar', assignment.getCalendarAssignments);
router.post('/assignments', assignment.createAssignment);
router.put('/assignments/:id', assignment.updateAssignment);
router.delete('/assignments/:id', assignment.deleteAssignment);

// --- GUARDIANS ---
router.get('/', guardian.getGuardians);
router.get('/:id', guardian.getGuardianById);
router.post('/', guardian.createGuardian);
router.put('/:id', guardian.updateGuardian);
router.delete('/:id', guardian.deleteGuardian);

export default router;
