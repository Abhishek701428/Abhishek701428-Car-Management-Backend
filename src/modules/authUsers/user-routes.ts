import { Router } from 'express';
import { signup, login } from '../authUsers/user-controller';

const router = Router();
router.post('/register', signup);
router.post('/login', login);

export default router;
