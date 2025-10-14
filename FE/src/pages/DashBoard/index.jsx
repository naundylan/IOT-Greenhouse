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
import Co2Icon from "@mui/icons-material/Co2";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import OpacityIcon from "@mui/icons-material/Opacity";
import ScienceIcon from "@mui/icons-material/Science";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, InfoCard } from "../../components/StyledComponent";
import Metric from "../../components/Metrics";
import { Dot } from "../../components/StyledComponent";
import StatusLevelModal from "../../components/StatusLevelModal";

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
        { level: 'Ẩm ướt', range: '> 80%', description: 'Đất quá ẩm ',color: '#64b5f6' }
    ],
    'Nhiệt độ đất': [   
         { level: 'Lạnh', range: '< 18°C', description: 'Quá lạnh, cây phát triển chậm.', color: '#64b5f6' },
        { level: 'Tối ưu', range: '22°C - 28°C', description: 'Nhiệt độ lý tưởng cho hầu hết các loại cây.', color: '#66bb6a' },
    ],
    // Mặc định cho các metric khác
    'default': [
        { level: 'Bình thường', range: 'N/A', description: 'Thông số trong ngưỡng an toàn.', color: '#66bb6a' }
    ]
};

const greenhouseUserData = {
    name: 'Admin (Offline)',
    avatarUrl: '/nen.png' // Đặt 1 ảnh avatar.png vào thư mục /public
};
const greenhouseData = {
    name: "Nhà kính số 1 - Khu A",
    plant: "Xà Lách 4 Mùa",
    status: "Tốt",
    metrics: [
        { id: 1, label: "CO₂", value: "1100 ppm", icon: <Co2Icon /> },
        { id: 2, label: "Ánh sáng", value: "6000 lux", icon: <WbSunnyIcon /> },
        { id: 3, label: "Nhiệt độ không khí", value: "28°C", icon: <ThermostatIcon /> },
        { id: 4, label: "Độ ẩm không khí", value: "65%", icon: <OpacityIcon /> },
        { id: 5, label: "Độ ẩm đất", value: "60%", icon: <OpacityIcon /> },
        { id: 6, label: "Nhiệt độ đất", value: "25°C", icon: <ScienceIcon /> },
    ],
    notifications: [
        { id: 1, message: "Nhiệt độ không khí vượt ngưỡng 32°C lúc 14:20", time: "2 giờ trước" },
        { id: 2, message: "Độ ẩm đất giảm xuống 45% lúc 13:15", time: "3 giờ trước" },
        { id: 3, message: "Ánh sáng đạt 1200 lux lúc 12:30", time: "4 giờ trước" },
        { id: 4, message: "CO2 đất ổn định ở mức 1500 ppm", time: "5 giờ trước" },
        { id: 5, message: "Hệ thống tưới tự động đã kích hoạt", time: "6 giờ trước" },
    ],
    chartData: [
        { time: "02:00", nhietdodat: 27, doamdat: 35, anhsang: 2000, nhietdokk: 20, doamkk: 50, co2: 800 },
        { time: "04:00", nhietdodat: 26, doamdat: 65, anhsang: 2000, nhietdokk: 25, doamkk: 60, co2: 900 },
        { time: "06:00", nhietdodat: 25, doamdat: 68, anhsang: 3000, nhietdokk: 30, doamkk: 70, co2: 800 },
        { time: "08:00", nhietdodat: 26, doamdat: 70, anhsang: 6000, nhietdokk: 30, doamkk: 60, co2: 850 },
        { time: "10:00", nhietdodat: 28, doamdat: 68, anhsang: 7000, nhietdokk: 28, doamkk: 50, co2: 870 },
        { time: "12:00", nhietdodat: 32, doamdat: 62, anhsang: 10000, nhietdokk: 34, doamkk: 40, co2: 1200 },
        { time: "14:00", nhietdodat: 35, doamdat: 70, anhsang: 9000, nhietdokk: 37, doamkk: 50, co2: 1150 },
        { time: "16:00", nhietdodat: 30, doamdat: 64, anhsang: 8000, nhietdokk: 34, doamkk: 70, co2: 1152 },
        { time: "18:00", nhietdodat: 25, doamdat: 72, anhsang: 6000, nhietdokk: 30, doamkk: 80, co2: 860 },
        { time: "20:00", nhietdodat: 24, doamdat: 75, anhsang: 6000, nhietdokk: 25, doamkk: 90, co2: 750 },
        { time: "22:00", nhietdodat: 27, doamdat: 78, anhsang: 3000, nhietdokk: 22, doamkk: 70, co2: 700 },
        { time: "24:00", nhietdodat: 28, doamdat: 80, anhsang: 3000, nhietdokk: 20, doamkk: 60, co2: 700 },
    ],
};
// ====================================================================

function DashboardPage() {
    // Phần chính của component DashboardPage
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    /* 
    const [error, setError] = useState(null);*/
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = useCallback(() => {
        // Hàm logout vẫn hoạt động bình thường
        localStorage.removeItem('userToken');
        navigate('/login');
    }, [navigate]);
    const handleSetting = useCallback(() => {
        navigate('/settings');
    }, [navigate]);
    // useEffect giờ đây sẽ chỉ dùng dữ liệu giả
    useEffect(() => {
        console.log("Đang chạy ở chế độ OFFLINE. Sử dụng Mock Data.");

        // Giả lập độ trễ như đang gọi API thật để thấy màn hình loading
        const timer = setTimeout(() => {
            setUser(greenhouseUserData);
            setDashboardData(greenhouseData);
            setLoading(false); // Tắt màn hình loading sau khi "tải" xong dữ liệu giả
        }, 1500); // Giả lập chờ 1.5 giây

        // Dọn dẹp timer khi component bị unmount
        return () => clearTimeout(timer);
    }, []);
    // useEffect sử dụng API
    /*
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Đặt lại lỗi cũ trước khi gọi API mới
                setError(null);
                
                // Dùng Promise.all để gọi cả 2 API cùng lúc cho hiệu năng tốt hơn
                const [userResponse, dashboardResponse] = await Promise.all([
                    getCurrentUser(),
                    getDashboardData()
                ]);

                // Cập nhật state với dữ liệu thật từ API
                setUser(userResponse.data);
                setDashboardData(dashboardResponse.data);

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
                // Xử lý lỗi token hết hạn
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                    handleLogout();
                } else {
                    // Xử lý các lỗi mạng hoặc server khác
                    setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
                }
            } finally {
                // Dù thành công hay thất bại, luôn tắt màn hình loading
                setLoading(false);
            }
        };

        fetchData();
    }, [handleLogout]);
    */
    // Mở modal mức độ trạng thái
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState(null);
    const handleMetricClick = (metric) => {
        setSelectedMetric(metric); // Lưu lại thông tin của metric được click
        setIsStatusModalOpen(true);    // Mở modal
    };

    const handleCloseStatusModal = () => {
        setIsStatusModalOpen(false); // Đóng modal
    };
    // Màn hình loading vẫn hoạt động
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 2 }}>
                <CircularProgress />
                <Typography>Đang tải giao diện (chế độ offline)...</Typography>
            </Box>
        );
    }
    /*
    // Màn hình lỗi
    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }
*/


    return (
        <Box sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundImage: "url(/nen.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
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
                            <MenuItem onClick={handleSetting}>Setting</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box sx={{ flex: 1, px: { xs: 1, md: 2 }, py: 2, position: "relative", zIndex: 1 }}>
                <Box sx={{
                    display: "grid",                                  // ⟵ dùng Grid thay vì Flex
                    gridTemplateColumns: { xs: "1fr", md: '1.5fr 1fr' }, // ⟵ 2 cột chính
                    gap: 3,
                    alignItems: "start",
                    minHeight: 0,
                    padding: 8,
                }}>
                    <InfoCard elevation={0} sx={{ p: 3 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <HomeIcon fontSize="large" />
                                <Typography variant="h4" fontWeight={700}>{dashboardData?.name}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <LocalFloristIcon />
                                <Typography variant="h6">{dashboardData?.plant}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Dot dotColor="#4caf50" />
                                <Typography variant="h6">Trạng thái: {greenhouseData.status}</Typography>
                            </Stack>
                            <Divider sx={{ opacity: .3, my: 1 }} />
                            <Box sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" },
                                gap: 6,
                                alignItems: "center",
                            }}>
                                {greenhouseData?.metrics?.map((m) => (<Metric key={m.id} {...m} onClick={() => handleMetricClick(m)} />))}
                            </Box>
                        </Stack>
                    </InfoCard>

                    <Card elevation={0} sx={{ p: 3, minWidth: 0 }}>
                        <Stack spacing={3} sx={{ height: "100%" }}>

                            {/* Thông báo */}
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                    <NotificationsActiveIcon color="success" />
                                    <Typography variant="h6">Thông báo trong 24h</Typography>
                                </Stack>
                                <Box
                                    sx={{
                                        maxHeight: 220,
                                        overflowY: "auto",
                                        pr: 1,
                                        "&::-webkit-scrollbar": { width: 6 },
                                        "&::-webkit-scrollbar-thumb": { bgcolor: "#ccc", borderRadius: 3 },
                                    }}
                                >
                                    <List dense>
                                        {greenhouseData.notifications.map((n, i) => (
                                            <React.Fragment key={n.id}>
                                                <ListItem
                                                    sx={{
                                                        bgcolor: i === 0 ? "rgba(255,0,0,0.05)" : "transparent",
                                                        borderRadius: 2,
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        <WarningAmberIcon color={i === 0 ? "error" : "warning"} />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={<Typography fontWeight={600}>{n.message}</Typography>}
                                                        secondary={<Typography variant="caption">{n.time}</Typography>}
                                                    />
                                                </ListItem>
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </Box>
                            </Box>

                            {/* Biểu đồ */}
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                    <QueryStatsIcon color="success" />
                                    <Typography variant="h6">Biểu đồ thông số</Typography>
                                </Stack>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={greenhouseData.chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis yAxisId="left" domain={[0, 100]} />
                                            <YAxis yAxisId="right" orientation="right" domain={[200, 10000]} />
                                            <Tooltip />
                                            <Legend />
                                            <Line yAxisId="left" type="monotone" dataKey="nhietdodat" stroke="#8B4513" name="Nhiệt độ đất (°C)" />
                                            <Line yAxisId="left" type="monotone" dataKey="doamdat" stroke="#1E90FF" name="Độ ẩm đất (%)" />
                                            <Line yAxisId="left" type="monotone" dataKey="nhietdokk" stroke="#FF7300" name="Nhiệt độ KK (°C)" />
                                            <Line yAxisId="left" type="monotone" dataKey="doamkk" stroke="#228B22" name="Độ ẩm KK (%)" />

                                            {/* Lớn (lux, ppm) → right */}
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