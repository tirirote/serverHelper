import { componentSchema } from '../schemas/componentSchema.js'

//BD
import { getDb } from '../db/dbLoader.js';

//AUX
const findExistingComponentByName = (name, res) => {

  const db = getDb();
  const existingComponent = db.components.find(c => c.name === name);
  if (existingComponent) {
    return res.status(409).json({ message: 'Ya existe un componente con este nombre.' });
  }
  return existingComponent;

};

export const findComponentByName = (name, res) => {
  const db = getDb();
  const component = db.components.find(c => c.name === name);
  if (!component) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }
  return component;

};

const findComponentIndexByName = (name, res) => {
  const db = getDb();
  const componentIndex = db.components.findIndex(c => c.name === name);
  if (componentIndex === -1) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }
  return componentIndex;
}

const validateComponent = (component, res) => {
  if (!component.type || !component.name || !component.price) {
    return res.status(400).json({ message: 'Faltan datos obligatorios para el componente.' });
  }
}

//API Methods
export const createComponent = (req, res) => {

  const db = getDb();

  const { error } = componentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const newComponent = req.body;
  validateComponent(newComponent, res);

  findExistingComponentByName(newComponent.name, res);

  db.components.push(newComponent);
  res.status(201).json({ message: 'Componente creado con éxito', component: newComponent });
};

export const deleteComponent = (req, res) => {

  const db = getDb();
  const { name } = req.params;
  const componentIndex = findComponentIndexByName(name, res);

  db.components.splice(componentIndex, 1); // Mutamos el array directamente

  res.status(200).json({ message: 'Componente eliminado con éxito.' });
};

export const updateComponent = (req, res) => {

  const db = getDb();
  const { name } = req.params;
  const newDetails = req.body;

  const componentIndex = findComponentIndexByName(name, res);

  db.components[componentIndex] = { ...db.components[componentIndex], ...newDetails };
  res.status(200).json({ message: 'Componente actualizado con éxito', component: db.components[componentIndex] });
};

export const getAllComponents = (req, res) => {

  const db = getDb();
  const components = db.components;
  res.status(200).json({ components });
};

export const getComponentByName = (req, res) => {

  const db = getDb();
  const { name } = req.params;

  const component = findComponentByName(name, res);

  res.status(200).json({ component });
};

export const getComponentPrice = (req, res) => {

  const db = getDb();
  const { name } = req.params;

  const component = findComponentByName(name, res);

  res.status(200).json({ price: component.price });
};

export const getComponentMaintenanceCost = (req, res) => {
  const db = getDb();
  const { name } = req.params;

  const component = findComponentByName(name, res);

  res.status(200).json({ maintenanceCost: component.maintenanceCost });
};

export const getComponentModelPath = (req, res) => {
  const db = getDb();
  const { name } = req.params;

  const component = findComponentByName(name, res);

  res.status(200).json({ modelPath: component.modelPath });
};

export const getComponentCompatibleList = (req, res) => {
  const { name } = req.params;

  const component = findComponentByName(name, res);

  res.status(200).json({ compatibleList: component.compatibleList });
};

export const getComponentDetails = (req, res) => {
  const { name } = req.params;

  const component = findComponentByName(name, res);

  res.status(200).json({ details: component.details });
};

export const getComponentType = (req, res) => {
  const { name } = req.params;

  const component = findComponentByName(name, res);

  res.status(200).json({ type: component.type });
};