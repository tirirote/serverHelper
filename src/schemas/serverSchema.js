import Joi from 'joi';

export const serverSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().max(255).optional().allow(''),
  // Los componentes son un array de objetos, pero validaremos su estructura en el controlador.
  components: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
  })).min(1).required(),
});