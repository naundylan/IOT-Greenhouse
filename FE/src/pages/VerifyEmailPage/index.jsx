 import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

function VerifyEmailPage() {
    // Get the email address passed from the sign-up page
    const location = useLocation();
    const email = location.state?.email;

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
                    Xác nhận email của bạn
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Cảm ơn bạn đã đăng ký! Chúng tôi đã gửi một liên kết xác nhận đến địa chỉ email của bạn:
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ mb: 3, wordBreak: 'break-all' }}>
                    {email || 'your email address'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) và nhấp vào liên kết đó để kích hoạt tài khoản của bạn.
                </Typography>
                 <Typography component={Link} to="/login" sx={{ mt: 3, textDecoration: 'none' }}>
                    Quay lại trang Đăng nhập
                </Typography>
            </Paper>
        </Box>
    );
}

export default VerifyEmailPage;