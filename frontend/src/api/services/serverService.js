import { apiClient } from "../api";

export const getAllServers = async () => {
  try {
    const response = await apiClient.get('/servers');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createServer = async (serverData) => {
  try {
    const response = await apiClient.post('/servers', serverData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteServer = async (serverName) => {
  try {
    const response = await apiClient.delete(`/servers/${serverName}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateServer = async (serverName) => {
  try {
    const response = await apiClient.put(`/servers/${serverName}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getServerByName = async (serverName) => {
  try {
    const response = await apiClient.get(`/servers/${serverName}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getServersComponents = async (serverName) => {
  try {
    const response = await apiClient.get(`/servers/${serverName}/components`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getServerTotalCost = async (serverName) => {
  try {
    const response = await apiClient.get(`/servers/${serverName}/total-cost`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getServerMaintenanceCost = async (serverName) => {
  try {
    const response = await apiClient.get(`/servers/${serverName}/maintenance-cost`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addComponentToServer = async (componentData) => {
  try {
    const response = await apiClient.get(`/add-component`, componentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};