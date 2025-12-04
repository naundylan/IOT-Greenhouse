// src/pages/SignUpPage/index.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    InputAdornment,
    IconButton,
    Stack,
    Alert,
    CircularProgress,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { signup } from '../../services/authService';
import StyledTextField from '../../components/StyledTextField';


function SignUpPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Hàm xử lý khi người dùng thay đổi giá trị trong form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };
    // Hàm xử lý khi người dùng submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const payload = {
                email: formData.email,
                username: formData.username,
                password: formData.password,
            }
            const response = await signup(payload);
            console.log("Đăng ký thành công:", response);

            alert("Đăng ký tài khoản thành công! Vui lòng xác thực email trước khi đăng nhập.");
            navigate("/verify-email", { state: { email: payload.email } });


        } catch (apiError) {
            console.error('Lỗi đăng ký:', apiError);
            const errorMessage = apiError.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const passwordInputProps = {
        startAdornment: (
            <InputAdornment position="start">
                <LockIcon sx={{ ml: 2, fontSize: 30 }} />
            </InputAdornment>
        ),
    };

    return (
        <Box sx={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            backgroundImage: `url('/login_bg.svg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    width: { xs: '95%', sm: '80%', md: '50%' },
                    maxWidth: '650px',
                    m: 'auto',
                    backgroundColor: 'rgba(34, 51, 30, 0.8)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: { xs: 3, sm: 5 },
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
                }}
            >
                <Typography color="white" variant="h3" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Đăng Ký Tài Khoản
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: '16px' }}>
                        {error}
                    </Alert>
                )}

                <Stack spacing={3} sx={{ width: '100%' }}>
                    <StyledTextField name="email" placeholder="Email" fullWidth required type="email" value={formData.email} onChange={handleChange}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><EmailIcon sx={{ ml: 2, fontSize: 30 }} /></InputAdornment>)
                        }}
                    />

                    <StyledTextField name="username" placeholder="Tên Người Dùng" fullWidth required value={formData.username} onChange={handleChange}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><PersonIcon sx={{ ml: 2, fontSize: 30 }} /></InputAdornment>)
                        }}
                    />

                    <StyledTextField
                        name="password"
                        placeholder="Mật Khẩu"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth required
                        value={formData.password}
                        onChange={handleChange}
                        InputProps={{
                            ...passwordInputProps,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ mr: 1, color: 'black' }}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <StyledTextField
                        name="confirmPassword"
                        placeholder="Xác Nhận Mật Khẩu"
                        type={showConfirmPassword ? 'text' : 'password'}
                        fullWidth required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        InputProps={{
                            ...passwordInputProps,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ mr: 1, color: 'black' }}>
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <Button type="submit" variant="contained" color="success" disabled={loading}
                        sx={{ height: '72px', borderRadius: '50px', fontSize: '22px', fontWeight: 'bold', textTransform: 'none' }}
                    >
                        {loading ? <CircularProgress size={30} color="inherit" /> : 'Đăng Ký'}
                    </Button>
                </Stack>

                <Typography color="#BDBDBD" mt={3} sx={{ fontSize: '18px' }}>
                    Bạn đã có tài khoản ?
                    <Link to="/login" style={{ color: '#81c784', fontWeight: 'bold', textDecoration: 'none' }}>
                        Đăng Nhập
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
}

export default SignUpPage;