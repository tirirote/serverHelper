import Joi from 'joi';
import { healthStatus } from './types.js';

export const serverSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().max(255).optional().allow(''),
  components: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
  })).min(1),
  totalPrice: Joi.number().positive(),
  totalMaintenanceCost: Joi.number().positive(),
  healthStatus: Joi.string().valid(...healthStatus).default('Unknown'),
  network: Joi.string(),
  ipAddress: Joi.string().ip({ version: ['ipv4'] }).optional().allow(''),
  operatingSystem: Joi.string().optional().allow('')
});