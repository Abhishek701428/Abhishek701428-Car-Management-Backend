import mongoose, { Document, Schema } from 'mongoose';

interface ICar extends Document {
  userId: string;
  title: string;
  description: string;
  tags: string[];
  images: string[];
}

const CarSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: [String], required: true },
  images: { type: [String], validate: [arrayLimit, '{PATH} exceeds the limit of 10'] },
});

function arrayLimit(val: string[]) {
  return val.length <= 10;
}

export const Car = mongoose.model<ICar>('Car', CarSchema);
