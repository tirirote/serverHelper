import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
//Creamos la api para nuestro backend
export const apiClient = axios.create({
  baseURL: baseURL,
});