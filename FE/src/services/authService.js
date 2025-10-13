import axios from 'axios';
// Giả sử backend của bạn chạy ở địa chỉ này
const API_URL = '/api/v1/auth';// <-- THAY ĐỔI URL NÀY CHO ĐÚNG VỚI BACKEND CỦA BẠN

// Tạo một instance của axios với cấu hình cơ bản
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Hàm đăng ký người dùng
export const registerUser = (userData) => {
    // Backend thường sẽ cần endpoint là /register hoặc /signup
    return apiClient.post('/register', userData); 
};
// Hàm đăng nhập người dùng
export const loginUser = (credentials) => {
    // !!! THAY ĐỔI '/login' nếu endpoint của bạn khác
    return apiClient.post('/login', credentials);
};
//Hàm quên mật khẩu
export const forgotPassword = (emailData) => {
    return apiClient.post('/forgot-password', emailData);
};
export const getCurrentUser = () => {
    // !!! THAY ĐỔI '/me' nếu endpoint của bạn khác (ví dụ: /profile)
    return apiClient.get('/me'); 
};
