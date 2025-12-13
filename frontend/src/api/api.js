import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
// Allow overriding via VITE_API_KEY; default value required by backend
const API_KEY = import.meta.env.VITE_API_KEY || 'tirirote'
// Creamos la api para nuestro backend — include the API key header by default
export const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'x-api-key': API_KEY,
  },
});