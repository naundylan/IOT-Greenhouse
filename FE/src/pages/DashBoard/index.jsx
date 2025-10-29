// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import {
  AppBar, Avatar, Box, Card, CircularProgress, Divider, IconButton,
  List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Stack,
  Switch, Toolbar, Typography
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import LightModeIcon from "@mui/icons-material/LightMode";
import Dot from "@mui/icons-material/FiberManualRecord";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from "@mui/material";
import { TextField } from "@mui/material";




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
const mockDashboardData = {
  id: 1,
  name: "Nhà kính số 1 - Khu A",
  plant: "Xà Lách 4 Mùa",
  status: "Tốt",
  metrics: [
    { id: 1, label: "CO₂", value: "1100 ppm" },
    { id: 2, label: "Ánh sáng", value: "6000 lux" },
    { id: 3, label: "Nhiệt độ không khí", value: "28°C" },
    { id: 4, label: "Độ ẩm không khí", value: "65%" },
    { id: 5, label: "Độ ẩm đất", value: "60%" },
    { id: 6, label: "Nhiệt độ đất", value: "25°C" },
  ],
  lightStatus: false,
  fanStatus: false,
  notifications: [
    { id: 1, type: "error", message: "Nhiệt độ không khí vượt ngưỡng 32°C lúc 14:20", time: "2 giờ trước" },
    { id: 2, type: "warning", message: "Độ ẩm đất giảm xuống 45% lúc 13:15", time: "3 giờ trước" },
    { id: 3, type: "warning", message: "Ánh sáng đạt 1200 lux lúc 12:30", time: "4 giờ trước" },
  ],
  chartData: [
    { time: "02:00", co2: 30, nhietdokk: 28, nhietdod: 25, anhsang: 2000, doamkk: 65, doamdat: 60 },
    { time: "06:00", co2: 35, nhietdokk: 30, nhietdod: 26, anhsang: 4000, doamkk: 67, doamdat: 62 },
    { time: "10:00", co2: 40, nhietdokk: 32, nhietdod: 27, anhsang: 8000, doamkk: 68, doamdat: 63 },
    { time: "14:00", co2: 45, nhietdokk: 33, nhietdod: 28, anhsang: 9500, doamkk: 69, doamdat: 64 },
    { time: "18:00", co2: 40, nhietdokk: 31, nhietdod: 26, anhsang: 3000, doamkk: 70, doamdat: 61 },
    { time: "22:00", co2: 35, nhietdokk: 29, nhietdod: 25, anhsang: 1500, doamkk: 66, doamdat: 59 },
  ],
};

function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const openMenu = Boolean(anchorEl);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    name: "Username",
    gender: "Non-binary",
    dob: "January 01, 2025",
    email: "havu2845@gmail.com",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const handleOpenMetricDetail = (metric) => {
    setSelectedMetric(metric);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMetric(null);
  };

  // 🔧 Handler Menu
  const handleClickMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleGoToSettings = () => {
    navigate("/settings");
    handleCloseMenu();
  };
  const handleLogout = () => {
    navigate("/login");
    handleCloseMenu();
  };

  const [openUserDialog, setOpenUserDialog] = useState(false);
  const handleOpenUserDialog = () => setOpenUserDialog(true);
  const handleCloseUserDialog = () => setOpenUserDialog(false);
  const handleUpdateProfile = () => {
    console.log("✅Thông tin đã cập nhập:", userInfo);
    // TODO: gửi dữ liệu lên server
    handleCloseUserDialog();
  };
  useEffect(() => {
    console.warn("📊 Dashboard đang chạy ở chế độ MOCKUP.");
    const timer = setTimeout(() => {
      setDashboardData(mockDashboardData);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);


  // 💡 Bật/Tắt đèn
  const handleToggleLight = async () => {
    if (!dashboardData) return;
    const newStatus = !dashboardData.lightStatus;
    setIsSwitchLoading(true);

    try {
      // Giả lập API
      await axios.patch(`/api/greenhouses/${dashboardData.id}/light`, { status: newStatus });
      // Update local state
      setDashboardData((prev) => ({ ...prev, lightStatus: newStatus }));
    } catch (err) {
      console.error("⚠️ Lỗi khi đổi trạng thái đèn:", err);
    } finally {
      setIsSwitchLoading(false);
    }
  };
  //Bật quạt
  const handleToggleFan = async () => {
    if (!dashboardData) return;
    const newStatus = !dashboardData.lightStatus;
    setIsSwitchLoading(true);
    try {
      // Giả lập API
      await axios.patch(`/api/greenhouses/${dashboardData.id}/light`, { status: newStatus });
      // Update local state
      setDashboardData((prev) => ({ ...prev, lightStatus: newStatus }));
    } catch (err) {
      console.error("⚠️ Lỗi khi đổi trạng thái đèn:", err);
    } finally {
      setIsSwitchLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Đang tải dữ liệu mockup...</Typography>
      </Box>
    );
  }


  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundImage: "url(/nen.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* ✅ Thanh AppBar */}
      <AppBar
        position="sticky"
        elevation={1}
        sx={{ background: "linear-gradient(to right, #6d8c33ff, #184d1bff)", color: "white" }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h5" fontWeight="bold">
            GREEHOUSE
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              sx={{ display: { xs: "none", sm: "block" }, cursor: "pointer" }}
              onClick={handleOpenUserDialog}
            >
              {userInfo.name}
            </Typography>
            <Avatar sx={{ cursor: "pointer" }} onClick={handleOpenUserDialog} />

            <IconButton color="inherit" onClick={handleClickMenu}>
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
              <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
              <Divider />
              <MenuItem onClick={handleGoToSettings}>Cài Đặt</MenuItem>

            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ✅ Nội dung hai cột */}
      <Box
        sx={{
          flexGrow: 1,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 2,
          p: { xs: 2, md: 3 },
          overflowY: "auto",
        }}
      >
        {/* 🌱 Cột trái: Thông tin nhà kính */}
        <Card
          sx={{
            p: 3,
            borderRadius: 6,
            background: "linear-gradient(to bottom right, #184d1bff, #49b74fff)",
            color: "white",
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <HomeIcon />
              <Typography variant="h5" fontWeight="bold">
                {dashboardData.name}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <LocalFloristIcon />
              <Typography variant="h6">{dashboardData.plant}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Dot sx={{ color: "lightgreen" }} />
              <Typography variant="h6">Trạng thái: {dashboardData.status}</Typography>
            </Stack>

            <Divider sx={{ opacity: 0.3 }} />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: 2,
              }}
            >
              {dashboardData.metrics.map((m) => (
                <Card
                  key={m.id}
                  sx={{
                    p: 5,
                    textAlign: "center",
                    borderRadius: 6,
                    background: "rgba(255, 255, 255, 0.93)",
                    color: "#333",
                    cursor: "pointer",
                    transition: "0.2s",
                    "&:hover": { transform: "scale(1.05)", boxShadow: 6 },
                  }}
                  onClick={() => handleOpenMetricDetail(m)}
                >
                  <Typography variant="caption" sx={{ opacity: 0.8, color: '#2e7d32' }}>
                    {m.label}
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#2e7d32", lineHeight: 1.2, fontWeight: 'bold' }}>
                    {m.value}
                  </Typography>
                </Card>
              ))}
            </Box>

            {/* 💡 Bật/Tắt đèn */}
            <Card
              sx={{
                mt: 2,
                p: 5,
                borderRadius: 6,
                background: "rgba(255,255,255,0.85)",
                color: "#2E5F40",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <LightModeIcon />
                <Typography fontWeight="bold">
                  Bóng Đèn
                </Typography>
              </Stack>

              <Switch
                checked={dashboardData.lightStatus}
                onChange={handleToggleLight}
                disabled={isSwitchLoading}
              />
            </Card>
            {/* 💡 Bật/Tắt quạt */}
            <Card
              sx={{
                mt: 2,
                p: 5,
                borderRadius: 6,
                background: "rgba(255,255,255,0.85)",
                color: "#2E5F40",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <LightModeIcon />
                <Typography fontWeight="bold">
                  Quạt
                </Typography>
              </Stack>

              <Switch
                checked={dashboardData.fanStatus}
                onChange={handleToggleFan}
                disabled={isSwitchLoading}
              />
            </Card>
          </Stack>
        </Card>

        {/* 📊 Cột phải: Thông báo + Biểu đồ */}
        <Card sx={{ p: 3, borderRadius: 3, background: "rgba(255,255,255,0.9)" }}>
          <Stack spacing={4}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <NotificationsActiveIcon color="success" />
                <Typography variant="h6" fontWeight="bold">
                  Thông báo trong 24h
                </Typography>
              </Stack>
              <List dense>
                {dashboardData.notifications.map((n) => (
                  <ListItem key={n.id} sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <WarningAmberIcon
                        color={n.type === "error" ? "error" : "warning"}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography fontWeight={500}>{n.message}</Typography>}
                      secondary={<Typography variant="caption">{n.time}</Typography>}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <QueryStatsIcon color="success" />
                <Typography variant="h6" fontWeight="bold">
                  Biểu đồ thông số
                </Typography>
              </Stack>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="time" />

                    {/* Trục Y trái */}
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke="#8884d8"
                      domain={[0, 100]} // Giới hạn để nhìn rõ
                    />
                    {/* Trục Y phải */}
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#82ca9d"
                      domain={[0, 2000]} // cho CO2, ánh sáng
                    />

                    <Tooltip />
                    <Legend />

                    {/* Các đường dùng trục trái */}
                    <Line yAxisId="left" type="monotone" dataKey="nhietdokk" stroke="#FF7300" name="Nhiệt độ KK (°C)" dot={false} />
                    <Line yAxisId="left" type="monotone" dataKey="doamkk" stroke="#228B22" name="Độ ẩm KK (%)" dot={false} />
                    <Line yAxisId="left" type="monotone" dataKey="doamdat" stroke="#4B8BBE" name="Độ ẩm đất (%)" dot={false} />
                    <Line yAxisId="left" type="monotone" dataKey="nhietdod" stroke="#8884d8" name="Nhiệt độ đất (°C)" dot={false} />

                    {/* Các đường dùng trục phải */}
                    <Line yAxisId="right" type="monotone" dataKey="anhsang" stroke="#E4C600" name="Ánh sáng (lux)" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="co2" stroke="#82ca9d" name="CO₂ (ppm)" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Stack>
        </Card>
      </Box>

{/* 💡 Bật tắt các thông số */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", color: "#2e7d32" }}>
          {selectedMetric?.label}
        </DialogTitle>
        <DialogContent dividers>
          {selectedMetric && (
            <>
              {(
                METRIC_STATUS_LEVELS[selectedMetric.label] ||
                METRIC_STATUS_LEVELS["default"]
              ).map((level, idx) => (
                <Card
                  key={idx}
                  sx={{
                    mb: 2,
                    p: 2,
                    background: level.color + "20", // màu mờ nhạt
                    borderLeft: `6px solid ${level.color}`,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: level.color }}>
                    {level.level}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#333" }}>
                    Khoảng giá trị: {level.range}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {level.description}
                  </Typography>
                </Card>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" sx={{ bgcolor: "#2e7d32" }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>


{/* 💡 Thông tin người dùng */}
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} sx= {{ borderRadius : "8px"}}>
        <DialogTitle>Thông tin người dùng</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, width: 500 , borderRadius : 4 , overflow: "visible"}}>
          <TextField
            label="Họ và tên"
            fullWidth
            value={userInfo.name}
            onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
          />
          <TextField
            label="Email"
            value={userInfo.email}
            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
          />
          <TextField
            label="Giới tính"
            value={userInfo.gender}
            onChange={(e) => setUserInfo({ ...userInfo, gender: e.target.value })}
          />
          <TextField
            label="Ngày sinh"
            value={userInfo.dob}
            onChange={(e) => setUserInfo({ ...userInfo, dob: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog} sx= {{ borderRadius : "8px"}}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleUpdateProfile} sx= {{ borderRadius : "8px"}}>
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default DashboardPage;
