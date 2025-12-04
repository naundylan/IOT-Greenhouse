import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ErrorIcon from '@mui/icons-material/Error';
import { Link, useLocation } from 'react-router-dom';
import { verifyEmail } from '../../services/authService';


function VerifyEmailSuccess() {
    const location = useLocation();
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const queryParams = new URLSearchParams(location.search);
                const email = queryParams.get('email');
                const token = queryParams.get('token');

                if (!email || !token) {
                    setStatus('error');
                    return;
                }

                const payload = { email, token };
                const response = await verifyEmail(payload);

                if (response.status === 200) {
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (err) {
                console.error('Error verifying email:', err);
                setStatus('error');
            }
        };

        verifyEmail();
    }, [location.search]);

    if (status === 'loading') {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    bgcolor: '#f0f2f5',
                }}
            >
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Đang xác thực tài khoản của bạn...</Typography>
            </Box>
        );
    }

    // ✅ Success UI
    if (status === 'success') {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    bgcolor: '#f0f2f5',
                    backgroundImage: 'url("/login_bg.svg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        maxWidth: '500px',
                        textAlign: 'center',
                        borderRadius: '16px',
                    }}
                >
                    <MarkEmailReadIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                        Xác nhận email của bạn thành công
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Cảm ơn bạn đã xác nhận email! Tài khoản của bạn đã được kích hoạt thành công.
                    </Typography>
                    <Typography component={Link} to="/login" sx={{ mt: 3, textDecoration: 'none' }}>
                        Quay lại trang Đăng nhập
                    </Typography>
                </Paper>
            </Box>
        );
    }
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                bgcolor: '#f0f2f5',
                backgroundImage: 'url("/login_bg.svg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '500px',
                    textAlign: 'center',
                    borderRadius: '16px',
                }}
            >
                <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Xác nhận thất bại
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Token không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại email của bạn.
                </Typography>
                <Typography component={Link} to="/login" sx={{ mt: 3, textDecoration: 'none' }}>
                    Quay lại trang Đăng nhập
                </Typography>
            </Paper>
        </Box>
    );
}

export default VerifyEmailSuccess;
