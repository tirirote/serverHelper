import { apiClient } from '../api';

export const createWorkspace = async (workspaceData) => {
    try {
        const response = await apiClient.post('/workspaces', workspaceData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getWorkspaces = async () => {
    try {
        const response = await apiClient.get('/workspaces');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getWorkspacesByName = async (name) => {
    try {
        const response = await apiClient.get(`/workspaces/${name}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};