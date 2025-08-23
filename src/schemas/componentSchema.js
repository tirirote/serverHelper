import Joi from 'joi';

export const componentSchema = Joi.object({
  type: Joi.string().valid('Chasis', 'CPU', 'RAM', 'HardDisk', 'BiosConfig', 'Fan', 'PowerSupply', 'GPU', 'Placa Base').required(),
  name: Joi.string().min(3).max(50).required(),
  cost: Joi.number().positive().required(),
  compatibleList: Joi.array().items(Joi.string()).optional().default([]),
  details: Joi.string().max(255).optional().allow(''),
  selled: Joi.boolean().default(false),
});