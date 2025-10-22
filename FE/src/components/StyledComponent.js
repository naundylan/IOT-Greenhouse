
import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

// 1. Đây là "công thức" cho Card cơ bản, màu trắng
export const Card = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  height: "100%",
  padding: theme.spacing(2),
  background: "rgba(255,255,255,0.92)",
  boxShadow: "0 8px 24px rgba(0,0,0,.06)",
}));

export const InfoCard = styled(Card)(({ theme }) => ({
  color: theme.palette.common.white,
  background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 50%, ${theme.palette.success.light} 100%)`,
}));

export const Dot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'dotcolor',
})(({ dotcolor }) => ({
    width: 10,              // đừng để 100%
    height: 10,             // đừng để 100%
    borderRadius: '50%',
    backgroundColor: dotcolor || '#4caf50',
    display: 'inline-block',
    marginRight: 8,
}));