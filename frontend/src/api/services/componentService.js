import { apiClient } from '../api';

export const getAllComponents = async () => {
  try {
    const response = await apiClient.get('/components');
    return response.data.components;
  } catch (error) {
    throw error;
  }
};

export const createComponent = async (componentData) => {
  try {
    const response = await apiClient.post('/components', componentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteComponent = async (componentName) => {
  try {
    const response = await apiClient.delete(`/components/${componentName}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateComponent = async (componentName, componentData) => {
  try {
    const response = await apiClient.put(`/components/${componentName}`, componentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getComponentByName = async (componentName) => {
  try {
    const response = await apiClient.get(`/components/${componentName}`);
    return response.data.component;
  } catch (error) {
    throw error;
  }
};

export const getComponentPrice = async (componentName) => {
  try {
    const response = await apiClient.get(`/components/${componentName}`);
    return response.data.component.price;
  } catch (error) {
    throw error;
  }
};

export const getComponentCompatibleList = async (componentName) => {
  try {
    const response = await apiClient.get(`/components/${componentName}/compatible`);
    return response.data.component.compatibleList;
  } catch (error) {
    throw error;
  }
};

export const getComponentDetails = async (componentName) => {
  try {
    const response = await apiClient.get(`/components/${componentName}/details`);
    return response.data.component.details;
  } catch (error) {
    throw error;
  }
};

export const getComponentType = async (componentName) => {
  try {
    const response = await apiClient.get(`/components/${componentName}/type`);
    return response.data.component.type;
  } catch (error) {
    throw error;
  }
};

export const getComponentMaintenanceCost = async (componentName) => {
  try {
    const response = await apiClient.get(`/components/${componentName}/maintenance-cost`);
    return response.data.component.maintenanceCost;
  } catch (error) {
    throw error;
  }
};

export const getComponentModelPath = async (componentName) => {
  try {
    const response = await apiClient.get(`/components/${componentName}/model-path`);
    return response.data.component.modelPath;
  } catch (error) {
    throw error;
  }
};