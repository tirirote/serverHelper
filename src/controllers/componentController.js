import { componentSchema } from '../schemas/componentSchema'

export const createComponent = (req, res) => {

  const { error } = componentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const newComponent = req.body;
  if (!newComponent.type || !newComponent.name || !newComponent.cost) {
    return res.status(400).json({ message: 'Faltan datos obligatorios para el componente.' });
  }

  const existingComponent = components.find(c => c.name === newComponent.name);
  if (existingComponent) {
    return res.status(409).json({ message: 'Ya existe un componente con este nombre.' });
  }

  components.push(newComponent);
  res.status(201).json({ message: 'Componente creado con éxito', component: newComponent });
};

export const deleteComponent = (req, res) => {
  const { name } = req.params;
  const initialLength = components.length;
  components = components.filter(c => c.name !== name);

  if (components.length === initialLength) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }
  res.status(200).json({ message: 'Componente eliminado con éxito.' });
};

export const updateComponent = (req, res) => {
  const { name } = req.params;
  const newDetails = req.body;

  const componentIndex = components.findIndex(c => c.name === name);
  if (componentIndex === -1) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }

  components[componentIndex] = { ...components[componentIndex], ...newDetails };
  res.status(200).json({ message: 'Componente actualizado con éxito', component: components[componentIndex] });
};

export const getComponentCost = (req, res) => {
  const { name } = req.params;
  const component = components.find(c => c.name === name);
  if (!component) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }
  res.status(200).json({ cost: component.cost });
};

export const getComponentCompatibleList = (req, res) => {
  const { name } = req.params;
  const component = components.find(c => c.name === name);
  if (!component) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }
  res.status(200).json({ compatibleList: component.compatibleList });
};

export const getComponentDetails = (req, res) => {
  const { name } = req.params;
  const component = components.find(c => c.name === name);
  if (!component) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }
  res.status(200).json({ details: component.details });
};

export const getComponentType = (req, res) => {
  const { name } = req.params;
  const component = components.find(c => c.name === name);
  if (!component) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }
  res.status(200).json({ type: component.type });
};