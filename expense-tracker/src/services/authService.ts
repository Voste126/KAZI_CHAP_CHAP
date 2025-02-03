import axios from 'axios';
import  API_URL  from '../utils/config';

export const registerUser = async (user: { email: string; password: string }) => {
    const response = await axios.post(`${API_URL}/register`, user);
    return response.data;
};

export const loginUser = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
};