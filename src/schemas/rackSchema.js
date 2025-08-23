import Joi from 'joi';

export const rackSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().max(255).optional().allow(''),
  units: Joi.number().integer().min(1).max(42).default(42),
  maintenanceCost: Joi.number().min(0).optional().default(0),
  // Los servidores y el coste total se calculan, no se validan en la entrada.
});