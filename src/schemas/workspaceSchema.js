import Joi from 'joi';

export const workspaceSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().max(255).optional().allow(''),
  // Los racks se gestionan a través de los controladores, no se validan aquí.
});