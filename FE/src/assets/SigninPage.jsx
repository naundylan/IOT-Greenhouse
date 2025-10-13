// src/pages/SignUp/index.jsx (Theo cấu trúc thư mục ta đã bàn)

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    InputAdornment,
    IconButton,
    Stack, // Dùng Stack để sắp xếp form cho gọn
} from '@mui/material';
import { styled } from '@mui/material/styles'; // Dùng để tạo component style riêng
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// === TỐI ƯU #1: TẠO STYLED COMPONENT ĐỂ TÁI SỬ DỤNG ===
// Thay vì lặp lại sx 4 lần, ta tạo một component TextField đã được style sẵn.
const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '50px',
        backgroundColor: 'white',
        height: '72px',
        // Thêm các style chung khác ở đây
        '& fieldset': {
            border: 'none', // Bỏ border mặc định
        },
    },
    '& .MuiInputBase-input': {
        fontSize: '20px',
        fontWeight: 'bold',
        paddingLeft: theme.spacing(1),
    }
}));


function SignUpPage() {
    const navigate = useNavigate();

    // === TỐI ƯU #2: THÊM STATE ĐỂ QUẢN LÝ FORM ===
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Ngăn trình duyệt reload
        // Xử lý logic đăng ký ở đây
        // Ví dụ: Kiểm tra password và confirmPassword có khớp không
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        console.log('Submitting data:', formData);
        // Gọi API đăng ký...
        // Sau khi thành công thì chuyển hướng
        // navigate('/login');
    };

    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                display: 'flex', // FIX #1: Dùng flexbox
                // backgroundImage: 'url(/login_bg.svg)', // FIX #2: Sửa đường dẫn ảnh
                backgroundColor: '#e8f5e9', // Dùng màu nền tạm thời nếu ảnh lỗi
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Form Container */}
            <Box
                component="form" // Dùng thẻ form cho đúng ngữ nghĩa
                onSubmit={handleSubmit}
                sx={{
                    width: { xs: '90%', md: '50%' }, // Tối ưu responsive
                    maxWidth: '700px', // Giới hạn chiều rộng tối đa
                    m: 'auto', // Tự động căn giữa
                    backgroundColor: 'rgba(34, 51, 30, 0.9)', // Thêm độ trong suốt
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: { xs: 2, md: 4 },
                    borderRadius: '20px',
                }}
            >
                <Typography color="white" variant="h3" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
                    {/* FIX #3: Sửa lại tên cho đúng chức năng */}
                    Create Account
                </Typography>

                <Stack spacing={3} sx={{ width: '100%' }}>
                    <StyledTextField
                        name="email"
                        placeholder="Email"
                        variant="outlined"
                        fullWidth
                        value={formData.email}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon sx={{ ml: 2, fontSize: 30 }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <StyledTextField
                        name="username"
                        placeholder="Username"
                        variant="outlined"
                        fullWidth
                        value={formData.username}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonIcon sx={{ ml: 2, fontSize: 30 }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <StyledTextField
                        name="password"
                        placeholder="Password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        fullWidth
                        value={formData.password}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon sx={{ ml: 2, fontSize: 30 }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ mr: 1 }}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <StyledTextField
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        fullWidth
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon sx={{ ml: 2, fontSize: 30 }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit" // Quan trọng để form hoạt động
                        variant="contained"
                        color="success"
                        sx={{
                            height: '72px',
                            borderRadius: '50px',
                            fontSize: '22px',
                            fontWeight: 'bold',
                            textTransform: 'none', // Bỏ viết hoa mặc định của Button
                        }}
                    >
                        Sign Up
                    </Button>
                </Stack>

                <Typography color="#9A9A9A" mt={3} sx={{ fontSize: '18px' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#66bb6a', fontWeight: 'bold', textDecoration: 'none' }}>
                        Sign In
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
}

export default SignUpPage;