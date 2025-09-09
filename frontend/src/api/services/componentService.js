import { apiClient } from '../api';

export const getComponents = async () => {
  try {
    const response = await apiClient.get('/components');
    return response.data;
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