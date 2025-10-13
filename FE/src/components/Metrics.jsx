// src/components/Metric.jsx

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// Chúng ta tạo một Card riêng cho Metric để dễ dàng tùy chỉnh style
// mà không ảnh hưởng đến các Card lớn khác.
const MetricCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.75)', // Nền trắng hơi trong
  boxShadow: 'none', // Bỏ đổ bóng để trông nhẹ nhàng hơn
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5), // Khoảng cách giữa icon và chữ
}));


// Component Metric nhận vào 3 props: icon, label, và value
function Metric({ icon, label, value }) {
  return (
    <MetricCard>
      {/* Phần vòng tròn chứa icon */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center", // Căn giữa icon một cách hoàn hảo
          flexShrink: 0, // Ngăn vòng tròn bị co lại
          bgcolor: "rgba(46, 125, 50, .1)", // Nền xanh lá cây rất nhạt
          color: "#2e7d32", // Màu xanh lá cây đậm cho icon
        }}
      >
        {icon}
      </Box>

      {/* Phần chứa text (label và value) */}
      <Box sx={{ minWidth: 0 }}> {/* Kỹ thuật để text không bị tràn khi quá dài */}
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
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