import { apiClient } from "../api";

export const createServer = async (serverData) => {
  try {
    const response = await apiClient.post('/servers', serverData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getServers = async () => {
  try {
    const response = await apiClient.get('/servers');
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

export const getServersComponents = async (serverName) => {
  try {
    const response = await apiClient.get(`/servers/${serverName}/components`);
    return response.data;
  } catch (error) {
    throw error;
  }
};