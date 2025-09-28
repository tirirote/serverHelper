import Joi from 'joi';

export const serverSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().max(255).optional().allow(''),
  components: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
  })).min(1),
  totalPrice: Joi.number().positive(),
  totalMaintenanceCost: Joi.number().positive(),
  network: Joi.string(),
});