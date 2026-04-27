import { Router } from 'express';
import multer from 'multer';
import { importExcel } from '../controllers/import.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/excel', authenticate, upload.single('file'), importExcel);

export default router;
