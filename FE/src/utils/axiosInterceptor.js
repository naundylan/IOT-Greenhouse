import axios from 'axios';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};


export const setupInterceptors = (apiClient) => {
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 410 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Gọi refresh token API
          const response = await axios.get('http://localhost:8100/v1/users/refresh_token', {
            withCredentials: true,
          });

          const { accessToken } = response.data;

          localStorage.setItem('accessToken', accessToken);

          originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;

          processQueue(null, accessToken);

          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);

          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');

          window.location.href = '/login';

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }
  );

  return apiClient;
};
