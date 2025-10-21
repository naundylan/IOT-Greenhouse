import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    Box, Button, Typography, IconButton, Stack, Alert, CircularProgress, InputAdornment
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { resetPassword } from '../../services/authService';
import StyledTextField from '../../components/StyledTextField';


function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Kiểm tra xem token có tồn tại trong URL không
    useEffect(() => {
        if (!token) {
            setError("Đường dẫn không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.");
        }
    }, [token]);

    const handleChange = (e) => {
        setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setError("Token không hợp lệ.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            await resetPassword(token, formData.password);
            setSuccess(true); // Chuyển sang trạng thái thành công
        } catch (apiError) {
            setError(apiError.response?.data?.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            width: '100vw', height: '100vh', display: 'flex',
            backgroundImage: `url({nen.png})`, backgroundSize: 'cover'
        }}>
            <Box sx={{
                width: { xs: '95%', sm: '80%', md: '50%' },
                maxWidth: '650px', m: 'auto',
                backgroundColor: 'rgba(34, 51, 30, 0.8)',
                backdropFilter: 'blur(10px)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', padding: { xs: 3, sm: 5 },
                borderRadius: '24px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)'
            }}>
                {success ? (
                    // Giao diện khi thành công
                    <Stack spacing={2} alignItems="center" textAlign="center">
                        <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main' }} />
                        <Typography color="white" variant="h4" fontWeight="bold">Thành Công!</Typography>
                        <Typography color="#BDBDBD">Mật khẩu của bạn đã được đặt lại thành công.</Typography>
                        <Button component={Link} to="/login" variant="contained" color="success" sx={{ mt: 2 }}>
                            Quay về trang Đăng nhập
                        </Button>
                    </Stack>
                ) : (
                    // Giao diện form
                    <>
                        <Typography color="white" variant="h3" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
                            Đặt Lại Mật Khẩu
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>
                        )}

                        <Stack component="form" onSubmit={handleSubmit} spacing={3} sx={{ width: '100%' }}>
                            <StyledTextField
                                name="password" placeholder="Mật khẩu mới"
                                type={showPassword ? 'text' : 'password'}
                                fullWidth required
                                value={formData.password}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (<InputAdornment position="start"><LockIcon sx={{ ml: 2, fontSize: 30 }} /></InputAdornment>),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ mr: 1, color: 'white' }}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <StyledTextField
                                name="confirmPassword" placeholder="Xác nhận mật khẩu mới"
                                type="password" fullWidth required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (<InputAdornment position="start"><LockIcon sx={{ ml: 2, fontSize: 30 }} /></InputAdornment>)
                                }}
                            />
                            <Button type="submit" variant="contained" color="success" disabled={loading || !token}
                                sx={{ height: '72px', borderRadius: '50px', fontSize: '22px', fontWeight: 'bold' }}>
                                {loading ? <CircularProgress size={30} color="inherit" /> : 'Xác Nhận'}
                            </Button>
                        </Stack>
                    </>
                )}
            </Box>
        </Box>
    );
}

export default ResetPasswordPage;