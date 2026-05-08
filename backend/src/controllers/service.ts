import { Response, NextFunction } from 'express';
import Service from '../models/Service';
import { IAuthRequest } from '../types/index';
import { NotFoundError, sendSuccess, handleAsync } from '../utils/errors';

// ─── GET ALL SERVICES ─────────────────────────────────────────────────────────
export const getAllServices = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { category, limit = '50', offset = '0' } = req.query;

    const query: any = { isActive: true };
    if (category) {
      query.category = category;
    }

    const total = await Service.countDocuments(query);
    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    sendSuccess(res, { services, total });
  }
);

// ─── GET SERVICE BY ID ────────────────────────────────────────────────────────
export const getServiceById = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }

    sendSuccess(res, service);
  }
);

// ─── GET SERVICE CATEGORIES ───────────────────────────────────────────────────
export const getServiceCategories = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const categories = await Service.distinct('category', { isActive: true });
    sendSuccess(res, { categories });
  }
);
