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
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { loginUser } from '../../services/authService';
import StyledTextField from '../../components/StyledTextField';

function LoginPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    // SỬA: Logic của hàm handleSubmit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {

            const response = await loginUser(formData);

            console.log('Đăng nhập thành công:', response.data);

            if (response.data.token) {
                localStorage.setItem('userToken', response.data.token);
            }

            // Chuyển hướng đến trang Dashboard hoặc trang chủ sau khi đăng nhập thành công
            navigate('/dashboard');

        } catch (apiError) {
            console.error('Lỗi đăng nhập:', apiError);
            const errorMessage = apiError.response?.data?.message || 'Email hoặc mật khẩu không đúng.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
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
                    Sign In
                </Typography>

                {error && (<Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: '16px' }}>{error}</Alert>)}

                <Stack spacing={3} sx={{ width: '100%' }}>
                    <StyledTextField name="email" placeholder="Email" fullWidth required type="email" value={formData.email} onChange={handleChange} InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon sx={{ ml: 2, fontSize: 30 }} /></InputAdornment>) }} />
                    <StyledTextField name="password" placeholder="Password" type={showPassword ? 'text' : 'password'} fullWidth required value={formData.password} onChange={handleChange} InputProps={{ startAdornment: (<InputAdornment position="start"><LockIcon sx={{ ml: 2, fontSize: 30 }} /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ mr: 1 }}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
                    <Typography align="right" sx={{ mt: -2, mb: 2 }}>
                        <Link to="/forgot-password" style={{ color: '#BDBDBD', fontSize: '16px' }}>
                            Forgot Password?
                        </Link>
                    </Typography>
                    <Button type="submit" variant="contained" color="success" disabled={loading} sx={{ height: '72px', borderRadius: '50px', fontSize: '22px', fontWeight: 'bold', textTransform: 'none' }}>
                        {loading ? <CircularProgress size={30} color="inherit" /> : 'Sign In'}
                    </Button>
                </Stack>

                {/* SỬA: Link điều hướng */}

                <Typography color="#BDBDBD" mt={3} sx={{ fontSize: '18px' }}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: '#81c784', fontWeight: 'bold', textDecoration: 'none' }}>
                        Sign Up
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
}

export default LoginPage;