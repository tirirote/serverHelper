import axios from 'axios';

//Creamos la api para nuestro backend
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});