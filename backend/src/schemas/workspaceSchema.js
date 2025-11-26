import Joi from 'joi';

export const workspaceSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  network: Joi.string().required(),
  description: Joi.string().max(255).optional().allow(''),
  racks: Joi.array().items(Joi.string()).optional().default([])
});