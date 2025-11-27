import { componentSchema } from '../schemas/componentSchema.js'
//BD
import { getDb } from '../db/dbLoader.js';
import { saveCollectionToDisk } from '../db/dbUtils.js';

//AUX
const findExistingComponentByName = async (componentName) => {
  const db = await getDb();
  
  const existingComponent = db.components.find(c => c.name === componentName);

  if (existingComponent) {
    const error = new Error('Ya existe un componente con este nombre.');
    error.status = 409; // 💡 Adjuntar status
    throw error;
  }
};

export const findComponentByName = async (componentName) => {
  const db = await getDb();
  
  const component = db.components.find(c => c.name === componentName);

  if (!component) {
    const error = new Error('Componente no encontrado.');
    error.status = 404; // 💡 Adjuntar status
    throw error;
  }

  return component;

};

const findComponentIndexByName = async (componentName) => {
  const db = await getDb();
  
  const componentIndex = db.components.findIndex(c => c.name === componentName);

  if (componentIndex === -1) {
    const error = new Error('Componente no encontrado.');
    error.status = 404; // 💡 Adjuntar status
    throw error;
  }

  return componentIndex;
}

const validateComponent = (componentToValidate) => {
  const { error, value } = componentSchema.validate(componentToValidate, { stripUnknown: true });

  if (error) {
    const validationError = new Error(error.details[0].message);
    validationError.status = 400; // 💡 Adjuntar status
    throw validationError;
  }

  return value;
}

const validateComponentDetails = (componentDetails) => {
  const { error, value } = componentSchema.optional().validate(componentDetails, { stripUnknown: true });
  
  if (error) {
    const validationError = new Error(error.details[0].message);
    validationError.status = 400; // 💡 Adjuntar status
    throw validationError;
  }

  return value;
};

//API Methods
export const createComponent = async (req, res) => {
  try {
    const db = await getDb();
    const components = [...db.components];
    const rawComponentData = req.body;

    // 1. Validación Joi (Pura, lanza 400)
    const validatedComponent = validateComponent(rawComponentData);

    // 2. Comprobación de existencia (Pura, lanza 409)
    await findExistingComponentByName(validatedComponent.name);

    // 3. Creación
    const newComponent = { ...validatedComponent };

    // 4. Persistencia
    components.push(newComponent);
    await saveCollectionToDisk(components, 'components');

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

export const deleteComponent = async (req, res) => {
  try {
    const db = await getDb();
    const components = [...db.components];
    const { name } = req.params;

    // El filtro es más simple que buscar el índice
    const updatedComponents = components.filter(c => c.name !== name);

    if (updatedComponents.length === components.length) {
      // Si la longitud no cambió, el componente no se encontró.
      return res.status(404).json({ message: 'Componente no encontrado.' });
    }

    // Persistencia
    await saveCollectionToDisk(updatedComponents, 'components');
    res.status(200).json({ message: 'Componente eliminado con éxito.' });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }
};

export const updateComponent = async (req, res) => {
  try {
    const db = await getDb();
    const components = [...db.components];
    const { name } = req.params;
    const { ...newDetails } = req.body;

    // 1. Encontrar el índice (Híbrido, devuelve 'res' si es 404)
    const componentIndex = await findComponentIndexByName(name);

    const currentComponent = components[componentIndex];

    // 2. Validación de Joi para la actualización (Pura, lanza 400)
    let validatedDetails = validateComponentDetails(newDetails);

    if (!validatedDetails) {
      validatedDetails = {};
    }

    // 3. Comprobación de duplicados si el nombre está siendo actualizado
    if (validatedDetails.name && validatedDetails.name !== currentComponent.name) {
      await findExistingComponentByName(validatedDetails.name); // Lanza 409 si el nuevo nombre ya existe
    }

    // 4. Aplicar cambios y asegurar el formato
    const updatedComponent = {
      ...currentComponent,
      ...validatedDetails
    };

    // 5. Persistencia
    components[componentIndex] = updatedComponent;
    await saveCollectionToDisk(components, 'components');

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

export const getAllComponents = async (req, res) => {
  const db = await getDb();
  const components = db.components;
  res.status(200).json({ components });
};

export const getComponentByName = async (req, res) => {
  const { name } = req.params;
  const component = await findComponentByName(name);
  res.status(200).json({ component });
};

export const getComponentPrice = async (req, res) => {
  const { name } = req.params;
  const component = await findComponentByName(name);
  res.status(200).json({ price: component.price });
};

export const getComponentMaintenanceCost = async (req, res) => {
  const { name } = req.params;
  const component = await findComponentByName(name);
  res.status(200).json({ maintenanceCost: component.maintenanceCost });
};

export const getComponentModelPath = async (req, res) => {
  const { name } = req.params;
  const component = await findComponentByName(name, res);
  res.status(200).json({ modelPath: component.modelPath });
};

export const getComponentCompatibleList = async (req, res) => {
  const { name } = req.params;
  const component = await findComponentByName(name);
  res.status(200).json({ compatibleList: component.compatibleList });
};

export const getComponentDetails = async (req, res) => {
  const { name } = req.params;
  const component = await findComponentByName(name);
  res.status(200).json({ details: component.details });
};

export const getComponentType = async (req, res) => {
  const { name } = req.params;
  const component = await findComponentByName(name);
  res.status(200).json({ type: component.type });
};