import { apiClient } from '../api';

export const getAllRacks = async (workspaceName) => {
  try {
    const response = await apiClient.get(`/racks/${workspaceName}`);
    return response.data.racks;
  } catch (error) {
    throw error;
  }
};

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

export const getRackByName = async (workspaceName, rackName) => {
  try {
    const response = await apiClient.get(`/racks/${workspaceName}/${rackName}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMaintenanceCost = async (workspaceName, rackName) => {
  try {
    const response = await apiClient.get(`/racks/${workspaceName}/${rackName}/maintenance-cost`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRack = async (rackName, updateData) => {
  try {
    const response = await apiClient.put(`/racks/${rackName}`, updateData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addServerToRack = async (rackName, serverName) => {
  try {
    const response = await apiClient.post(`/racks/add-server`, { rackName, serverName });
    return response.data;
  } catch (error) {
    throw error;
  }
};