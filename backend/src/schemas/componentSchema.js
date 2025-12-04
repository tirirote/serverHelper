import Joi from 'joi';

export const componentSchema = Joi.object({
  type: Joi.string().optional().allow(''),
  name: Joi.string().min(3).max(50).optional().allow(''),
  price: Joi.number().required(),  
  maintenanceCost: Joi.number().allow(null),
  estimatedConsumption: Joi.number().allow(null),
  compatibleList: Joi.array().items(Joi.string()).optional().default([]),
  details: Joi.string().max(255).optional().allow(''),
  isSelled: Joi.boolean().default(false),
  modelPath: Joi.string().trim().allow(null, '')
});