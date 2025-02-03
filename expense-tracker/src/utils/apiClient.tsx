import axios, { AxiosInstance } from 'axios';
import API_URL from '../utils/config';

// Create an Axios instance with a base URL and default headers
const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL, // Base URL for your API (set in .env)
    timeout: 10000, // Timeout for API requests (10 seconds)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include authentication tokens if needed
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken'); // Retrieve token from storage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Attach token to headers
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle global errors
apiClient.interceptors.response.use(
    (response) => {
        return response; // Return successful responses
    },
    (error) => {
        if (error.response) {
            // Handle specific HTTP status codes
            const { status } = error.response;

            if (status === 401) {
                console.error('Unauthorized: Token expired or invalid.');
                // Optionally redirect to login or clear the token
                localStorage.removeItem('authToken');
                window.location.href = '/login'; // Redirect to login page
            } else if (status === 403) {
                console.error('Forbidden: Access denied.');
            } else if (status === 404) {
                console.error('Not Found: The requested resource does not exist.');
            } else if (status >= 500) {
                console.error('Server Error: An unexpected error occurred on the server.');
            }
        }
        return Promise.reject(error); // Propagate the error
    }
);

export default apiClient;