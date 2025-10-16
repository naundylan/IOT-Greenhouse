// src/pages/DashBoard/index.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    AppBar, Avatar, Box, Divider, List, ListItem,
    ListItemIcon, ListItemText, Toolbar, Typography, Stack, IconButton,
    CircularProgress, Alert, Menu, MenuItem
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import MenuIcon from '@mui/icons-material/Menu';
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, InfoCard, Dot } from "../../components/StyledComponent"; 
import Metric from "../../components/Metrics";
import StatusLevelModal from "../../components/StatusLevelModal";
import { getCurrentUser } from "../../services/authService";
import { getDashboardData } from "../../services/dashboardService";


// Dữ liệu giả cho các mức độ trạng thái vẫn được giữ lại
const METRIC_STATUS_LEVELS = {
    'CO₂': [
        { level: 'Thấp', range: '< 400 ppm', description: 'Cây quang hợp chậm, cần bổ sung CO₂.', color: '#64b5f6' }, // blue
        { level: 'Tối ưu', range: '800 - 1200 ppm', description: 'Mức độ lý tưởng cho sự phát triển của cây.', color: '#66bb6a' }, // green
        { level: 'Cao', range: '1201 - 2000 ppm', description: 'Nồng độ cao, có thể không hiệu quả, cần thông gió.', color: '#ffa726' }, // orange
        { level: 'Nguy hiểm', range: '> 2000 ppm', description: 'Nồng độ rất cao, có thể gây hại cho cây.', color: '#ef5350' } // red
    ],

    'Ánh sáng': [
        { level: 'Lạnh', range: '< 18°C', description: 'Quá lạnh, cây phát triển chậm.', color: '#64b5f6' },
        { level: 'Tối ưu', range: '22°C - 28°C', description: 'Nhiệt độ lý tưởng cho hầu hết các loại cây.', color: '#66bb6a' },
        { level: 'Nóng', range: '> 30°C', description: 'Quá nóng, cây có thể bị stress nhiệt.', color: '#ef5350' }
    ],

    'Độ ẩm không khí': [
        { level: 'Khô', range: '< 50%', description: 'Không khí khô, cây dễ mất nước.', color: '#ffa726' },
        { level: 'Tối ưu', range: '60% - 75%', description: 'Độ ẩm phù hợp cho sự phát triển.', color: '#66bb6a' },
        { level: 'Ẩm ướt', range: '> 85%', description: 'Độ ẩm cao, dễ gây nấm mốc và bệnh.', color: '#64b5f6' }
    ],

    'Nhiệt độ không khí': [
        { level: 'Lạnh', range: '< 18°C', description: 'Quá lạnh, cây phát triển chậm.', color: '#64b5f6' },
        { level: 'Tối ưu', range: '22°C - 28°C', description: 'Nhiệt độ lý tưởng cho hầu hết các loại cây.', color: '#66bb6a' },
    ],

    'Độ ẩm đất': [
        { level: 'Khô', range: '< 40%', description: 'Đất quá khô, cần tưới nước.', color: '#ef5350' },
        { level: 'Tối ưu', range: '50% - 70%', description: 'Độ ẩm đất phù hợp cho sự phát triển của cây.', color: '#66bb6a' },
        { level: 'Ẩm ướt', range: '> 80%', description: 'Đất quá ẩm ', color: '#64b5f6' }
    ],

    'Nhiệt độ đất': [
        { level: 'Lạnh', range: '< 18°C', description: 'Quá lạnh, cây phát triển chậm.', color: '#64b5f6' },
        { level: 'Tối ưu', range: '22°C - 28°C', description: 'Nhiệt độ lý tưởng cho hầu hết các loại cây.', color: '#66bb6a' },
    ],
    'default': [
        { level: 'Bình thường', range: 'N/A', description: 'Thông số trong ngưỡng an toàn.', color: '#66bb6a' }
    ]
};

function DashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // BƯỚC 4: Kích hoạt lại state `error`
    const [error, setError] = useState(null);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('userToken');
        navigate('/login');
    }, [navigate]);

    const handleSetting = useCallback(() => {
        // Sửa lại đường dẫn cho đúng
        navigate('/setting'); 
    }, [navigate]);

    // BƯỚC 2: Kích hoạt lại useEffect gọi API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setError(null);
                const [userResponse, dashboardResponse] = await Promise.all([
                    getCurrentUser(),
                    getDashboardData()
                ]);
                setUser(userResponse.data);
                setDashboardData(dashboardResponse.data);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                    handleLogout();
                } else {
                    setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [handleLogout]);

    // Logic mở/đóng modal giữ nguyên
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState(null);
    const handleMetricClick = (metric) => {
        setSelectedMetric(metric);
        setIsStatusModalOpen(true);
    };
    const handleCloseStatusModal = () => {
        setIsStatusModalOpen(false);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 2 }}>
                <CircularProgress />
                <Typography>Đang tải dữ liệu từ máy chủ...</Typography>
            </Box>
        );
    }

    // Kích hoạt lại màn hình lỗi
    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{
            height: "100vh",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundImage: "url(/nen.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
        }}>
            <AppBar position="sticky" elevation={0} sx={{ background: "linear-gradient(to right, #97B067, #437057)", color: "white" }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h5" fontWeight="bold">GREENHOUSE</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>{user?.name}</Typography>
                        <Avatar alt={user?.name} src={user?.avatarUrl} />
                        <IconButton color="inherit" onClick={handleClick}>
                            <MenuIcon />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                            <MenuItem onClick={handleSetting}>Cài Đặt</MenuItem>
                            <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 } }}>
                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: '1.5fr 1fr' },
                    gap: 3,
                    alignItems: "start",
                }}>
                    <InfoCard>
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <HomeIcon fontSize="large" />
                                {/* BƯỚC 3: Sửa lại để dùng state `dashboardData` */}
                                <Typography variant="h4" fontWeight={700}>{dashboardData?.name}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <LocalFloristIcon />
                                <Typography variant="h6">{dashboardData?.plant}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Dot />
                                <Typography variant="h6">Trạng thái: {dashboardData?.status}</Typography>
                            </Stack>
                            <Divider sx={{ opacity: .3, my: 1 }} />
                            <Box sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                                gap: 2,
                            }}>
                                {dashboardData?.metrics?.map((m) => (
                                    <Metric key={m.id} {...m} onClick={() => handleMetricClick(m)} />
                                ))}
                            </Box>
                        </Stack>
                    </InfoCard>

                    <Card sx={{ minWidth: 0 }}>
                        <Stack spacing={4}>
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                    <NotificationsActiveIcon color="success" />
                                    <Typography variant="h6" fontWeight="bold">Thông báo 24h</Typography>
                                </Stack>
                                <Box sx={{ maxHeight: 240, overflowY: "auto", pr: 1 }}>
                                    <List dense>
                                        {dashboardData?.notifications?.map((n) => (
                                            <ListItem key={n.id} sx={{ mb: 1 }}>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <WarningAmberIcon color={n.type === 'error' ? "error" : "warning"} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={<Typography fontWeight={500}>{n.message}</Typography>}
                                                    secondary={<Typography variant="caption">{n.time}</Typography>}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </Box>

                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                    <QueryStatsIcon color="success" />
                                    <Typography variant="h6" fontWeight="bold">Biểu đồ thông số</Typography>
                                </Stack>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={dashboardData?.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="nhietdodat" stroke="#8B4513" name="Nhiệt độ đất (°C)" />
                                            <Line type="monotone" dataKey="doamdat" stroke="#1E90FF" name="Độ ẩm đất (%)" />
                                            <Line type="monotone" dataKey="nhietdokk" stroke="#FF7300" name="Nhiệt độ KK (°C)" />
                                            <Line type="monotone" dataKey="doamkk" stroke="#228B22" name="Độ ẩm KK (%)" />
                                            <Line yAxisId="right" type="monotone" dataKey="anhsang" stroke="#FFD700" name="Ánh sáng (lux)" />
                                            <Line yAxisId="right" type="monotone" dataKey="co2" stroke="#800080" name="CO₂ (ppm)" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Box>
                        </Stack>
                    </Card>
                </Box>
            </Box>

            <StatusLevelModal
                open={isStatusModalOpen}
                onClose={handleCloseStatusModal}
                metric={selectedMetric}
                levels={METRIC_STATUS_LEVELS[selectedMetric?.label] || METRIC_STATUS_LEVELS['default']}
            />
        </Box>
    );
}

export default DashboardPage;