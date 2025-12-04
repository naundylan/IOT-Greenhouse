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
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 410 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              apiClient(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // ✅ Gọi API refresh token (cookie tự động gửi)
          await axios.get('http://localhost:8100/v1/users/refresh_token', {
            withCredentials: true
          });

          processQueue(null);

          // Retry request gốc
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);

          localStorage.removeItem('userData');
          localStorage.removeItem('lastFetchedDay');

          window.location.href = '/login';

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      if (error.response?.status === 401) {
        localStorage.removeItem('userData');
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }
  );
};
