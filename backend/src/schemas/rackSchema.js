import Joi from 'joi';
import { healthStatus, powerStatus } from './types.js';

export const rackSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().max(255).optional().allow(''),
  units: Joi.number().integer().min(1).max(42).default(42),
  servers: Joi.array().items(Joi.string()).optional().default([]),  
  totalCost: Joi.number().min(0).optional().default(0),
  totalMaintenanceCost: Joi.number().min(0).optional().default(0),
  workspaceName: Joi.string().required(),
  healthStatus: Joi.string().valid(...healthStatus).default('Unknown'),
  powerStatus: Joi.string().valid(...powerStatus).default('Off')
});