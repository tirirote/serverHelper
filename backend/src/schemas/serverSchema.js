import Joi from 'joi';
import { healthStatus } from './types.js';

export const serverSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().max(255).optional().allow(''),
  components: Joi.array().items(Joi.string().max(100)).min(1).required(),
  totalPrice: Joi.number(),
  totalMaintenanceCost: Joi.number(),
  healthStatus: Joi.string().valid(...healthStatus).default('Unknown'),
  network: Joi.string(),
  ipAddress: Joi.string().ip({ version: ['ipv4'] }).optional().allow(''),
  operatingSystem: Joi.string().optional().allow('')
});