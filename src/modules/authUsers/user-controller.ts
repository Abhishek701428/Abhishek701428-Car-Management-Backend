import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../authUsers/user-model';

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });

        await user.validate();
        await user.save();

        // Create a token for the new user
        const token = jwt.sign({ id: user._id }, process.env.AUTH_SECRET_KEY || '', { expiresIn: '1d' });

        res.status(201).json({ message: 'User created successfully', token });
    } catch (error) {
        console.error('Error in signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }


        const token = jwt.sign({ id: user._id }, process.env.AUTH_SECRET_KEY || '', { expiresIn: '1d' });
        res.json({ token });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
};
