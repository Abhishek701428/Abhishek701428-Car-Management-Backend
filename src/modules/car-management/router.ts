import { Router } from 'express';
import * as carController from './car-controller';
import { authMiddleware } from '../../middleware/authMiddleware';
import { cloudinaryMiddleware } from '../../middleware/cloudinaryMiddleware';
const router = Router();

router.post('/add', authMiddleware, carController.addCar);
router.get('/getAll', cloudinaryMiddleware, authMiddleware, carController.getCars);
router.get('/search', authMiddleware, carController.searchCars);
router.get('/get/:id', cloudinaryMiddleware, authMiddleware, carController.getCarById);
router.put('/update/:id', authMiddleware, carController.updateCar);
router.delete('/delete/:id', authMiddleware, carController.deleteCar);

export default router;
