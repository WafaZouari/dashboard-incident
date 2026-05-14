import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as roleController from '../controllers/role.controller';

const router = Router();

router.use(authenticate);

router.get('/', roleController.getRoles);
router.post('/', roleController.createRole);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

export default router;
