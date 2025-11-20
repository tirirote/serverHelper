import { apiClient } from '../api';

export const getAllNetworks = async () => {
    try {
        const response = await apiClient.get('/networks');
        return response.data.networks;
    } catch (error) {
        throw error;
    }
};

export const createNetwork = async (networkData) => {
    try {
        const response = await apiClient.post('/networks', networkData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteNetworkByName = async (networkName) => {
    try {
        const response = await apiClient.delete(`/networks/${networkName}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getNetworkByName = async (networkName) => {
    try {
        const response = await apiClient.get(`/networks/${networkName}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};