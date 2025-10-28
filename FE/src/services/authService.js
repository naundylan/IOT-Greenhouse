import axios from 'axios';
// Giả sử backend của bạn chạy ở địa chỉ này
const API_URL = 'http://localhost:8100/v1';

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
    return apiClient.post('users/register', userData); 
};
// Hàm đăng nhập người dùng
export const loginUser = (credentials) => {
    // !!! THAY ĐỔI '/login' nếu endpoint của bạn khác
    return apiClient.post('users/login', credentials);
};
//Hàm quên mật khẩu
export const forgotPassword = (emailData) => {
    return apiClient.post('users/password/forgot', emailData);
};
export const getCurrentUser = () => {
    return apiClient.get('users/verify'); 
};
// Hàm đặt lại mật khẩu
export const resetPassword = (resetData) => {
    return apiClient.post('users/password/reset', resetData);
};
// Hàm đăng xuất người dùng
export const logoutUser = () => {
    return apiClient.post('users/logout');
};
export const updateUserProfile = (userData) => {
    return apiClient.put('users/update', userData);
}
