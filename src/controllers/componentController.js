import { db } from '../db/index.js';
import { componentSchema } from '../schemas/componentSchema.js'

export const createComponent = (req, res) => {

  const { error } = componentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const newComponent = req.body;
  if (!newComponent.type || !newComponent.name || !newComponent.cost) {
    return res.status(400).json({ message: 'Faltan datos obligatorios para el componente.' });
  }

  const existingComponent = db.components.find(c => c.name === newComponent.name);
  if (existingComponent) {
    return res.status(409).json({ message: 'Ya existe un componente con este nombre.' });
  }

  db.components.push(newComponent);
  res.status(201).json({ message: 'Componente creado con éxito', component: newComponent });
};

export const deleteComponent = (req, res) => {
  const { name } = req.params;
  const componentIndex = db.components.findIndex(c => c.name === name);

  if (componentIndex === -1) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }

  db.components.splice(componentIndex, 1); // Mutamos el array directamente
  res.status(200).json({ message: 'Componente eliminado con éxito.' });
};

export const updateComponent = (req, res) => {
  const { name } = req.params;
  const newDetails = req.body;

  const componentIndex = db.components.findIndex(c => c.name === name);
  if (componentIndex === -1) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }

  db.components[componentIndex] = { ...db.components[componentIndex], ...newDetails };
  res.status(200).json({ message: 'Componente actualizado con éxito', component: db.components[componentIndex] });
};

export const getComponentByName = (req, res) => {
  const { name } = req.params;
  const component = db.components.find(c => c.name === name);

  if (!component) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }
  res.status(200).json({ component });
};

export const getComponentCost = (req, res) => {
  const { name } = req.params;
  const component = db.components.find(c => c.name === name);
  if (!component) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }
  res.status(200).json({ cost: component.cost });
};

export const getComponentCompatibleList = (req, res) => {
  const { name } = req.params;
  const component = db.components.find(c => c.name === name);
  if (!component) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }
  res.status(200).json({ compatibleList: component.compatibleList });
};

export const getComponentDetails = (req, res) => {
  const { name } = req.params;
  const component = db.components.find(c => c.name === name);
  if (!component) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }
  res.status(200).json({ details: component.details });
};

export const getComponentType = (req, res) => {
  const { name } = req.params;
  const component = db.components.find(c => c.name === name);
  if (!component) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }
  res.status(200).json({ type: component.type });
};