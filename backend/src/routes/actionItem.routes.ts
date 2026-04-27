import { Router } from 'express';
import * as actionItem from '../controllers/actionItem.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', actionItem.getActionItems);
router.get('/overdue', actionItem.getOverdueActionItems);
router.get('/:id', actionItem.getActionItemById);
router.post('/', actionItem.createActionItem);
router.put('/:id', actionItem.updateActionItem);
router.patch('/:id/status', actionItem.updateActionItemStatus);

export default router;
