import { Request, Response } from 'express';
import { Car } from '../car-management/car-model';
import { cloudinaryMiddleware } from '../../middleware/cloudinaryMiddleware';

export const addCar = async (req: Request, res: Response) => {
  cloudinaryMiddleware(req, res, async (err) => {
    if (err) return res.status(400).json({ message: 'Error uploading images' });

    const { title, description, tags } = req.body;
    const user = (req as any).user;
    const images = req.body.cloudinaryUrls;

    const car = new Car({ userId: user.id, title, description, tags, images });

    try {
      await car.save();
      res.status(201).json(car);
    } catch (error) {
      res.status(500).json({ message: 'Error adding car', error });
    }
  });
};

export const getCars = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const cars = await Car.find({ userId: user.id });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cars', error });
  }
};

export const getCarById = async (req: Request, res: Response) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const user = (req as any).user;
    if (car.userId.toString() !== user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json(car);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching car', error });
  }
};

export const updateCar = async (req: Request, res: Response) => {
  cloudinaryMiddleware(req, res, async (err) => {
    if (err) return res.status(400).json({ message: 'Error uploading images' });

    try {
      const car = await Car.findById(req.params.id);
      if (!car) return res.status(404).json({ message: 'Car not found' });

      const user = (req as any).user;
      if (car.userId.toString() !== user.id) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      const { title, description, tags } = req.body;
      const images = req.body.cloudinaryUrls || car.images;

      car.title = title;
      car.description = description;
      car.tags = tags;
      car.images = images;

      await car.save();
      res.json(car);
    } catch (error) {
      res.status(500).json({ message: 'Error updating car', error });
    }
  });
};

export const deleteCar = async (req: Request, res: Response) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const user = (req as any).user;
    if (car.userId.toString() !== user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    await car.delete();
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting car', error });
  }
};

export const searchCars = async (req: Request, res: Response) => {
  const keyword = req.query.q?.toString();
  try {
    const cars = await Car.find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } },
      ],
    });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Error searching cars', error });
  }
};
