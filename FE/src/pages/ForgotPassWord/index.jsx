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

import { forgotPassword } from '../../services/authService';
import StyledTextField from '../../components/StyledTextField';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null); // State cho thông báo thành công

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            await forgotPassword({ email });

            // QUAN TRỌNG: Không chuyển hướng. Chỉ hiển thị thông báo.
            // Đây là một best practice về bảo mật để tránh lộ thông tin email nào đã đăng ký.
            setSuccessMessage('Nếu email của bạn tồn tại trong hệ thống, một liên kết đặt lại mật khẩu đã được gửi đi.');

        } catch (apiError) {
            console.error('Lỗi gửi email reset:', apiError);
            const errorMessage = apiError.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
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
                <Typography color="white" variant="h3" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Forgot Password
                </Typography>
                <Typography color="#BDBDBD" sx={{ mb: 3, textAlign: 'center' }}>
                    Enter your email to receive a password reset link.
                </Typography>

                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{successMessage}</Alert>}

                <Stack spacing={3} sx={{ width: '100%' }}>
                    <StyledTextField name="email" placeholder="Email" fullWidth required type="email" value={email} onChange={(e) => setEmail(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon sx={{ ml: 2, fontSize: 30 }} /></InputAdornment>) }} />
                    
                    {/* Vô hiệu hóa nút sau khi đã gửi thành công */}
                    <Button type="submit" variant="contained" color="success" disabled={loading || successMessage} sx={{ height: '72px', borderRadius: '50px', fontSize: '22px', fontWeight: 'bold', textTransform: 'none' }}>
                        {loading ? <CircularProgress size={30} color="inherit" /> : 'Send Reset Link'}
                    </Button>
                </Stack>

                <Typography color="#BDBDBD" mt={3} sx={{ fontSize: '18px' }}>
                    <Link to="/login" style={{ color: '#81c784', fontWeight: 'bold', textDecoration: 'none' }}>
                        &larr; Back to Sign In
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
}

export default ForgotPasswordPage;