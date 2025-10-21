import axios from 'axios';
// Giả sử backend của bạn chạy ở địa chỉ này
const API_URL = 'http://localhost:8100/v1/users';

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
    return apiClient.post('/password/forgot', emailData);
};
// Hàm lấy thông tin người dùng hiện tại
export const getCurrentUser = () => {
    return apiClient.get('/verify'); 
};
// Hàm đặt lại mật khẩu
export const resetPassword = (token, newPassword) => {
    return apiClient.post('/password/reset', { token, newPassword });
};
// Hàm đăng xuất người dùng
export const logoutUser = () => {
    return apiClient.post('/logout');
};
export const updateUserProfile = (profileData) => {
    return apiClient.put('/update', profileData); 
};
