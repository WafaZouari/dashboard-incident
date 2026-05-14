import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as userController from '../controllers/user.controller';

const router = Router();

// Secure all user routes
router.use(authenticate);

// Ideally, we would add an admin authorization middleware here
// router.use(authorizeRole(['ADMIN']));

router.get('/', userController.getUsers);
router.put('/:id/role', userController.updateUserRole);
router.put('/:id/status', userController.updateUserStatus);
router.put('/:id/password', userController.updateUserPassword);

export default router;
