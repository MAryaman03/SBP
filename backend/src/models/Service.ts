import mongoose, { Schema, Document } from 'mongoose';
import { IService } from '../types/index';

interface IServiceDocument extends IService, Document {}

const serviceSchema = new Schema<IServiceDocument>(
  {
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Service duration is required'],
      min: [15, 'Duration must be at least 15 minutes'],
      max: [480, 'Duration cannot exceed 480 minutes'],
    },
    price: {
      type: Number,
      required: [true, 'Service price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Service category is required'],
      enum: ['Hair', 'Skincare', 'Makeup', 'Massage', 'Bridal', 'Nails', 'Other'],
    },
    image: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ createdAt: -1 });

export default mongoose.model<IServiceDocument>('Service', serviceSchema);
