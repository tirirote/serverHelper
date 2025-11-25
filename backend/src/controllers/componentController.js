import { componentSchema } from '../schemas/componentSchema.js'

//BD
import { getDb } from '../db/dbLoader.js';
import { saveCollectionToDisk } from '../db/dbUtils.js';

//AUX
const findExistingComponentByName = (componentName, res) => {

  const db = getDb();
  const existingComponent = db.components.find(c => c.name === componentName);
  if (existingComponent) {
    return res.status(409).json({ message: 'Ya existe un componente con este nombre.' });
  }
};

export const findComponentByName = (componentName, res) => {
  const db = getDb();
  const component = db.components.find(c => c.name === componentName);
  if (!component) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }
  return component;

};

const findComponentIndexByName = (componentName, res) => {
  const db = getDb();
  const componentIndex = db.components.findIndex(c => c.name === componentName);
  if (componentIndex === -1) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }
  return componentIndex;
}

const validateComponent = (componentToValidate, res) => {
  const { error, value } = componentSchema.validate(componentToValidate, { stripUnknown: true });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  return value;
}

const validateComponentDetails = (componentDetails, res) => {
  const { error, value } = componentSchema.optional().validate(componentDetails, { stripUnknown: true });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  return value;
};

//API Methods
export const createComponent = (req, res) => {
  try {
    const db = getDb();
    const components = [...db.components];
    const rawComponentData = req.body;

    // 1. Validación Joi (Pura, lanza 400)
    const validatedComponent = validateComponent(rawComponentData);

    // 2. Comprobación de existencia (Pura, lanza 409)
    findExistingComponentByName(validatedComponent.name);

    // 3. Creación
    const newComponent = {
      ...validatedComponent
    };

    // 4. Persistencia
    components.push(newComponent);
    saveCollectionToDisk(components, 'components');

    res.status(201).json({
      message: 'Componente creado con éxito',
      component: newComponent
    });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || 'Error interno del servidor.'
    });
  }


};

export const deleteComponent = (req, res) => {
  try {
    const db = getDb();
    const components = [...db.components];
    const { name } = req.params;

    // El filtro es más simple que buscar el índice
    const updatedComponents = components.filter(c => c.name !== name);

    if (updatedComponents.length === components.length) {
      // Si la longitud no cambió, el componente no se encontró.
      return res.status(404).json({ message: 'Componente no encontrado.' });
    }

    // Persistencia
    saveCollectionToDisk(updatedComponents, 'components');
    res.status(200).json({ message: 'Componente eliminado con éxito.' });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }
};

export const updateComponent = (req, res) => {
  try {
    const db = getDb();
    const components = [...db.components];
    const { name } = req.params;
    const { ...newDetails } = req.body;

    // 1. Encontrar el índice (Híbrido, devuelve 'res' si es 404)
    const componentIndex = findComponentIndexByName(name, res);
    if (componentIndex === res) return;

    const currentComponent = components[componentIndex];

    // 2. Validación de Joi para la actualización (Pura, lanza 400)
    let validatedDetails = validateComponentDetails(newDetails, res);

    if (!validatedDetails) {
      validatedDetails = {};
    }

    // 3. Comprobación de duplicados si el nombre está siendo actualizado
    if (validatedDetails.name && validatedDetails.name !== currentComponent.name) {
      findExistingComponentByName(validatedDetails.name); // Lanza 409 si el nuevo nombre ya existe
    }

    // 4. Aplicar cambios y asegurar el formato
    const updatedComponent = {
      ...currentComponent,
      ...validatedDetails
    };

    // 5. Persistencia
    components[componentIndex] = updatedComponent;
    saveCollectionToDisk(components, 'components');

    res.status(200).json({
      message: 'Componente actualizado con éxito',
      component: updatedComponent
    });

  } catch (error) {
    // Captura errores 400 (Joi) y 409 (Existencia)
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || 'Error interno del servidor.'
    });
  }
};

export const getAllComponents = (req, res) => {
  const db = getDb();
  const components = db.components;
  res.status(200).json({ components });
};

export const getComponentByName = (req, res) => {
  const { name } = req.params;
  const component = findComponentByName(name, res);
  res.status(200).json({ component });
};

export const getComponentPrice = (req, res) => {
  const { name } = req.params;
  const component = findComponentByName(name, res);
  res.status(200).json({ price: component.price });
};

export const getComponentMaintenanceCost = (req, res) => {
  const { name } = req.params;
  const component = findComponentByName(name, res);
  res.status(200).json({ maintenanceCost: component.maintenanceCost });
};

export const getComponentModelPath = (req, res) => {
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