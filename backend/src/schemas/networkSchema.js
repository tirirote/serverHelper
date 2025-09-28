import Joi from 'joi';

export const networkSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  ipAddress: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).required(),
  subnetMask: Joi.string().ip({ version: ['ipv4', 'ipv6'], cidr: 'required' }).required(),
  gateway: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).required(),
});