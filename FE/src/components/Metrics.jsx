// src/components/Metric.jsx

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled component cho card, giúp code gọn gàng
const MetricCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.85)', // Nền trắng hơi trong để hợp với ảnh nền
  boxShadow: 'none', // Mặc định không có đổ bóng
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  transition: 'all 0.2s ease-in-out', // Thêm hiệu ứng chuyển động mượt mà
}));

// ====================================================================
// COMPONENT METRIC HOÀN CHỈNH
// ====================================================================
function Metric({ icon, label, value, onClick }) {
  return (
    // BƯỚC 1: Gắn `onClick` vào component cha
    // BƯỚC 2: Thêm `sx` để thay đổi giao diện khi tương tác
    <MetricCard
      onClick={onClick}
      sx={{
        // QUAN TRỌNG: Đổi con trỏ chuột để người dùng biết là có thể click
        cursor: 'pointer', 
        
        // QUAN TRỌNG: Thêm hiệu ứng khi người dùng di chuột vào
        '&:hover': {
          transform: 'translateY(-3px)', // Hơi nhấc lên một chút
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)', // Thêm đổ bóng nhẹ
          background: 'rgba(255, 255, 255, 1)', // Nền trắng rõ hơn
        }
      }}
    >
      {/* Phần vòng tròn chứa icon */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          bgcolor: "rgba(46, 125, 50, .1)",
          color: "#2e7d32",
        }}
      >
        {icon}
      </Box>

      {/* Phần chứa text (label và value) */}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ opacity: 0.8, color: '#2e7d32' }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ color: "#2e7d32", lineHeight: 1.2, fontWeight: 'bold' }}>
          {value}
        </Typography>
      </Box>
    </MetricCard>
  );
}

export default Metric;