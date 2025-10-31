import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        textAlign: 'center',
        p: 2,
      }}
    >
      {/* Hình minh họa 404 */}
      <Box
        component="img"
        src="/500.svg" // 👈 hình nằm trong thư mục public
        alt="404 Internal Server Error"
        sx={{
          width: { xs: '80%', sm: '60%', md: '40%' },
          maxWidth: 500,
          mb: 4,
        }}
      />

      {/* Tiêu đề */}
      <Typography
        variant="h4"
        sx={{ fontWeight: 'bold', color: '#1b5e20', mb: 2 }}
      >
        Internal Server Error
      </Typography>

      {/* Mô tả */}
      <Typography
        variant="body1"
        sx={{
          color: '#4f4f4f',
          maxWidth: 420,
          mb: 4,
        }}
      >
        The website is experiencing technical difficulties. Please try again later.
      </Typography>

      {/* Nút điều hướng */}
      <Button
        variant="contained"
        color="success"
        onClick={() => navigate('/')} // 👈 quay lại trang chủ
        sx={{
          textTransform: 'none',
          fontSize: 18,
          px: 4,
          py: 1.5,
          borderRadius: '50px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        }}
      >
        Go Back
      </Button>
    </Box>
  );
};

export default NotFoundPage;
