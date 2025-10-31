import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    InputAdornment,
    Stack,
    Alert,
    CircularProgress,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import StyledTextField from '../../components/StyledTextField';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import { IconButton } from '@mui/material';
import { resetPassword } from '../../services/authService';

function ResetPasswordPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }
        if (formData.password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }
        setError(null);
        setLoading(true);

        try {
            const payload = {
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                token: "/refresh_token",
            }
            const response = await resetPassword(payload);
            console.log('Đổi mật khẩu thành công! Vui lòng đăng nhập', response.data);
            navigate('/login');

        } catch (apiError) {
            console.error('Lỗi đổi mật khẩu:', apiError);
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
            backgroundImage: 'url(/login_bg.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }}>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    width: { xs: '95%', sm: '80%', md: '50%' },
                    maxWidth: '650px',
                    m: 'auto',
                    backgroundColor: '#22331E',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: { xs: 3, sm: 4, md: 5 },
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
                }}
            >

                <Typography color="white" variant="h3" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Đổi mật khẩu
                </Typography>

                {error && (<Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: '16px' }}>{error}</Alert>)}

                <Stack spacing={3} sx={{ width: '100%' }}>
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
                        {loading ? <CircularProgress size={30} color="inherit" /> : 'Tiếp tục'}
                    </Button>
                </Stack>
                {/* SỬA: Link điều hướng */}

                <Typography color="#BDBDBD" mt={3} sx={{ fontSize: '18px' }}>
                    Bạn đã có tài khoản?{' '}
                    <Link to="/login" style={{ color: '#81c784', fontWeight: 'bold', textDecoration: 'none' }}>
                        Đăng Nhập
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
}

export default ResetPasswordPage;