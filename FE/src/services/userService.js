import axios from 'axios';

const API_URL = '/api/v1/users'; 

const apiClient = axios.create({
    baseURL: API_URL,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const updateUserProfile = (profileData) => {
    return apiClient.put('/profile', profileData); 
};

export const changePassword = (passwordData) => {
    return apiClient.post('/change-password', passwordData);
};