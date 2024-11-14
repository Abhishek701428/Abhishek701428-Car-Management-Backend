import cloudinary from 'cloudinary';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error('Invalid file type. Only JPG, JPEG, and PNG files are allowed.'));
    }
};


const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 10);

export interface CloudinaryUploadResponse {
    secure_url: string;
}

export const uploadToCloudinary = (fileBuffer: Buffer, filename: string): Promise<CloudinaryUploadResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
            { public_id: filename, resource_type: 'image' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result as CloudinaryUploadResponse);
            }
        );
        Readable.from(fileBuffer).pipe(uploadStream);
    });
};


export const cloudinaryMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ message: 'File upload failed', error: err.message });
        }

        try {

            if (Array.isArray(req.files) && req.files.length > 0) {
                req.body.cloudinaryUrls = [];
                for (const file of req.files) {
                    const result = await uploadToCloudinary(file.buffer, file.originalname);
                    req.body.cloudinaryUrls.push(result.secure_url);
                }
            }
            next();
        } catch (uploadError) {
            console.error('Cloudinary upload error:', uploadError);
            res.status(500).json({ message: 'Error uploading images to Cloudinary' });
        }
    });
};
