import { apiClient } from '../api';

export const createRack = async (rackData) => {
  try {
    const response = await apiClient.post('/racks', rackData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteRack = async (workspaceName, rackName) => {
  try {
    const response = await apiClient.delete(`/racks/${workspaceName}/${rackName}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMaintenanceCost = async (workspaceName, rackName) => {
  try {
    const response = await apiClient.get(`/racks/${workspaceName}/${rackName}/maintenance`);
    return response.data;
  } catch (error) {
    throw error;
  }
};