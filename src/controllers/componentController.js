// Simulación de la base de datos de componentes
export const components = [
  {
    type: 'Chasis',
    name: 'Chasis 1U',
    cost: 250,
    compatibleList: ['Placa Base 1', 'Placa Base 2'],
    details: 'Chasis para servidores de 1U de altura.',
    selled: false,
  },
  {
    type: 'CPU',
    name: 'Intel Xeon E5-2690',
    cost: 1500,
    compatibleList: ['Placa Base 1'],
    details: 'CPU de alto rendimiento para servidores.',
    selled: false,
  },
  {
    type: 'RAM',
    name: 'DDR4 32GB',
    cost: 300,
    compatibleList: ['Placa Base 1', 'Placa Base 2'],
    details: 'Módulo de memoria RAM de 32GB.',
    selled: false,
  },
  {
    type: 'HardDisk',
    name: 'SSD 1TB',
    cost: 100,
    compatibleList: ['Placa Base 1', 'Placa Base 2'],
    details: 'Disco de estado sólido de 1TB.',
    selled: false,
  },
  {
    type: 'BiosConfig',
    name: 'BIOS Standard',
    cost: 50,
    compatibleList: ['Placa Base 1', 'Placa Base 2'],
    details: 'Configuración de BIOS estándar.',
    selled: false,
  },
  {
    type: 'Fan',
    name: 'Ventilador 80mm',
    cost: 15,
    compatibleList: ['Chasis 1U', 'Chasis 2U'],
    details: 'Ventilador de 80mm para refrigeración.',
    selled: false,
  },
  {
    type: 'PowerSupply',
    name: 'Fuente 500W',
    cost: 75,
    compatibleList: ['Chasis 1U', 'Chasis 2U'],
    details: 'Fuente de alimentación de 500W.',
    selled: false,
  },
  {
    type: 'GPU',
    name: 'NVIDIA A100',
    cost: 5000,
    compatibleList: ['Placa Base 1'],
    details: 'GPU de alto rendimiento para cargas de trabajo de IA.',
    selled: false,
  },
  // Componentes adicionales para compatibilidad
  {
    type: 'Placa Base',
    name: 'Placa Base 1',
    cost: 400,
    compatibleList: ['Intel Xeon E5-2690', 'DDR4 32GB', 'SSD 1TB', 'BIOS Standard', 'NVIDIA A100'],
    details: 'Placa base compatible con el chasis 1U.',
    selled: false,
  }
];

export const createComponent = (req, res) => {
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