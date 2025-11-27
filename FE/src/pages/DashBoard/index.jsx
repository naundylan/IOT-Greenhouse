// src/pages/DashboardPage.jsx
import React, { useEffect, useState, useRef } from "react";
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
import {
  getHistoryDataChart,
  getDeviceStatus,
} from '../../services/sensorApi';
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from "@mui/material";
import { TextField } from "@mui/material";
import { io } from "socket.io-client";
import SensorChart from "./chartSensor";
import { getHistoryAlertData } from "../../services/historyApi";  

const SOCKET_URL = "http://localhost:8100";
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

const getMetricStatus = (type, value) => {
  const levels = METRIC_STATUS_LEVELS[type] || METRIC_STATUS_LEVELS["default"];

  // Duyệt qua từng mức trong cấu hình
  for (const level of levels) {
    // Loại bỏ ký tự không phải số, dấu so sánh và khoảng trắng
    const rangeText = level.range.replace(/ppm|°C|%/g, "").trim();

    // Trường hợp dạng "< 400"
    if (/^<\s*\d+(\.\d+)?$/.test(rangeText)) {
      const num = parseFloat(rangeText.replace("<", "").trim());
      if (value < num) return level;
    }

    // Trường hợp dạng "> 2000"
    if (/^>\s*\d+(\.\d+)?$/.test(rangeText)) {
      const num = parseFloat(rangeText.replace(">", "").trim());
      if (value > num) return level;
    }

    // Trường hợp dạng "800 - 1200"
    if (/^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?$/.test(rangeText)) {
      const [min, max] = rangeText.split("-").map((v) => parseFloat(v.trim()));
      if (value >= min && value <= max) return level;
    }
  }

  // Không khớp range nào → trả về mặc định
  return METRIC_STATUS_LEVELS["default"][0];
};

const formatNumber = (num) => {
  if (num == null || isNaN(num)) return null;
  return parseFloat(num.toFixed(2));
};

function DashboardPage() {
  const [socketStatus, setSocketStatus] = useState("Không hoạt động");
  const [dashboardData, setDashboardData] = useState({
    "type": "DATA",
    "sensorId": "6905de6db3d11eac58e5a2b1",
    "sensorName": "Cảm biến vườn rau",
    "deviceId": "nhakinh01",
    "data": {
      "time": "2025-11-02T22:17:20",
      "air_humidity": 50,
      "light": 22,
      "air_temperature": 60,
      "soil_moisture": 44,
      "co2": 800,
      "soil_temperature": 22
    },
    "controlMode": "AUTO",
    lightStatus: false,
    fanStatus: false
  });

  const [chartData, setChartData] = useState([]);
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // 🔄 Lấy dữ liệu lịch sử từ API
        const raw = await getHistoryDataChart(dashboardData.deviceId);

        // 🕓 Lấy ngày hiện tại theo giờ Việt Nam (UTC+7)
        const today = new Date(Date.now() + 7 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        // 🔍 Lọc dữ liệu ngày hôm nay & loại trùng time (giữ record sau)
        const todayDataMap = raw.reduce((acc, item) => {
          if (!item?.time) return acc;
          const itemDate = item.time.split("T")[0];
          if (itemDate === today) acc[item.time] = item;
          return acc;
        }, {});

        // Chuyển object về mảng
        const todayData = Object.values(todayDataMap);

        // 🔧 Format dữ liệu
        const formatted = todayData.map((item) => ({
          time: item.time,
          air_humidity: formatNumber(item.air_humidity),
          light: formatNumber(item.light),
          air_temperature: formatNumber(item.air_temperature),
          soil_moisture: formatNumber(item.soil_moisture),
          co2: formatNumber(item.co2),
          soil_temperature: formatNumber(item.soil_temperature),
        }));

        // 💾 Lưu vào state
        setChartData(formatted);
      } catch (error) {
        console.error("❌ Lỗi lấy dữ liệu chart:", error);
      }
    };

    if (dashboardData?.deviceId) {
      fetchChartData();

      // 🔁 Tự động kiểm tra khi sang ngày mới
      const checkDayChange = setInterval(() => {
        const currentDay = new Date(Date.now() + 7 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        // Lấy ngày đã lưu lần trước
        const storedDay = localStorage.getItem("lastFetchedDay");

        // Nếu ngày đã thay đổi, fetch lại dữ liệu
        if (storedDay !== currentDay) {
          localStorage.setItem("lastFetchedDay", currentDay);
          fetchChartData();
        }

      }, 60 * 1000); // kiểm tra mỗi phút

      // cleanup interval khi component unmount
      return () => clearInterval(checkDayChange);
    }
  }, [dashboardData?.deviceId]);

  const [alertData, setAlertData] = useState([]);
  useEffect(() => {
    const fetchAlertData = async () => {
      try {
        // 🔄 Lấy dữ liệu lịch sử từ API
        const raw = await getHistoryAlertData();
        console.log("🚨 Dữ liệu alert lịch sử:", raw);

        // 🔧 Format dữ liệu
        const formatted = raw.map((item) => ({
          time: item.timestamp,
          parameterName: item.parameterName,
          triggeredValue: formatNumber(item.triggeredValue),
          message: item.message,
          type: item.type || "warning"
        }));

        // 💾 Lưu vào state
        setAlertData(formatted);
      } catch (error) {
        console.error("❌ Lỗi lấy dữ liệu chart:", error);
      }
    };
    fetchAlertData()
  }, []);

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
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMetric(null);
  };
  const socket = useRef(null);
  // ⚡ SOCKET.IO CLIENT
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    socket.current = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true
    });

    socket.current.on("connect", () => {
      setSocketStatus("Hoạt động");
      socket.current.emit('AUTH', token);
    });

    socket.current.on("disconnect", () => {
      setSocketStatus("Không hoạt động");
    });

    socket.current.off("BE_DATA");
    socket.current.off("BE_ALERT");

    socket.current.on("BE_DATA", (dashboardBE) => {
      // Định dạng dữ liệu mới
      const newRecord = {
        time: dashboardBE.data.time,
        air_humidity: formatNumber(dashboardBE.data.air_humidity),
        light: formatNumber(dashboardBE.data.light),
        air_temperature: formatNumber(dashboardBE.data.air_temperature),
        soil_moisture: formatNumber(dashboardBE.data.soil_moisture),
        co2: formatNumber(dashboardBE.data.co2),
        soil_temperature: formatNumber(dashboardBE.data.soil_temperature),
      };
      // const newDashboardBE = {
      //   type: "DATA",
      //   sensorId: "6905de6db3d11eac58e5a2b1",
      //   sensorName: "Cảm biến vườn rau",
      //   deviceId: "nhakinh01",
      //   data: newRecord
      // }

      // Cập nhật state
      // setDashboardData(newDashboardBE);
      setDashboardData((prev) => ({
        ...prev,
        data: newRecord
      }));
      setChartData((prevData) => {
        console.log("📶 Dữ liệu mới nhận từ BE:", newRecord);
        return [...prevData, newRecord];
      });

    });

    socket.current.on("BE_ALERT", (data) => {
      console.log("🚨 Alert nhận được từ BE:", data);
      setAlertData((prevData) => {
        const newRecord = {
          time: data.timestamp,
          parameterName: data.parameterName,
          triggeredValue: formatNumber(data.triggeredValue),
          message: data.message,
          type: data.type || "warning",
        };

        // Nếu đã có alert cùng parameterName → ghi đè bản mới
        // const filtered = prevData.filter(
        //   (item) => item.parameterName !== newRecord.parameterName
        // );

        const updated = [newRecord, ...prevData];
        return updated;
      });
    });
    socket.current.on("FE_COMMAND", (data) => {
      setDashboardData((prev) => {
        const updated = { ...prev };
        if (data.command === "LIGHT_ON") updated.lightStatus = true;
        if (data.command === "LIGHT_OFF") updated.lightStatus = false;
        if (data.command === "FAN_ON") updated.fanStatus = true;
        if (data.command === "FAN_OFF") updated.fanStatus = false;
        if (data.controlMode) updated.controlMode = data.controlMode;
        return updated;
      })
      setIsSwitchLoading(false);
    })

    return () => {
      // Dọn sạch khi component unmount
      socket.current.off("BE_DATA");
      socket.current.off("BE_ALERT");
      socket.current.off("FE_COMMAND");
      socket.current.disconnect();
    };
  }, []);

  // 🔧 Handler Menu
  const handleClickMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleGoToSettings = () => {
    navigate("/settings");
    handleCloseMenu();
  };
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    navigate("/login");
    handleCloseMenu();
  };
  const handleHistory = () => {
    navigate("/history");
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
  const handleOpenMetricDetail = (value, label) => {
    setSelectedMetric({ value, label });
    setOpenDialog(true);
  }


  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        setUserInfo({
          name: userData.name || "Chưa có tên",
          gender: userData.gender || "Không xác định",
          dob: userData.dob || "Không rõ",
          email: userData.email,
        });
        setLoading(false);
      } catch (err) {
        console.error("❌ Lỗi khi tải Dashboard:", err);

        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [navigate]);


  // 💡 Bật/Tắt đèn
  const handleToggleLight = () => {
    if (!dashboardData) return;
    const newStatus = !dashboardData.lightStatus;
    const command = newStatus ? "LIGHT_ON" : "LIGHT_OFF";
    setDashboardData(prev => ({
      ...prev,
      lightStatus: newStatus
    }))
    // setIsSwitchLoading(true);

    socket.current.emit("FE_COMMAND", {
      deviceId: dashboardData.deviceId,
      command: command
    });

    // Timeout nếu không nhận được phản hồi
    setTimeout(() => {
      setIsSwitchLoading(false);
    }, 5000);
  };

  // 🌬️ Bật/Tắt quạt
  const handleToggleFan = () => {
    if (!dashboardData) return;
    const newStatus = !dashboardData.fanStatus;
    const command = newStatus ? "FAN_ON" : "FAN_OFF";
    setDashboardData(prev => ({
      ...prev,
      fanStatus: newStatus
    }))
    // setIsSwitchLoading(true);

    socket.current.emit("FE_COMMAND", {
      deviceId: dashboardData.deviceId,
      command: command
    });

    // Timeout nếu không nhận được phản hồi
    setTimeout(() => {
      setIsSwitchLoading(false);
    }, 5000);
  };

  useEffect(() => {
    const initState = async () => {
        // const deviceId = "nhakinh01";
        const data = await getDeviceStatus();
        const sensordata = Array.isArray(data) ? data[0] : data;
        
        if (data) {
            setDashboardData(prev => ({
                ...prev,
                lightStatus: sensordata.relays?.LIGHT === 'ON', 
                fanStatus: sensordata.relays?.FAN === 'ON',
                controlMode: sensordata.controlMode || 'MANUAL'
            }));
        }
    };

    initState();
  }, []);

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
              <Divider />
              <MenuItem onClick={handleHistory}>Lịch sử</MenuItem>
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
                {dashboardData.deviceId}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <LocalFloristIcon />
              <Typography variant="h6">{dashboardData.sensorName}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Dot sx={{ color: "lightgreen" }} />
              <Typography variant="h6">Trạng thái: {socketStatus}</Typography>
            </Stack>

            <Divider sx={{ opacity: 0.3 }} />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: 2.5,
              }}
            >
              {/* // Co2 */}
              <Card
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 4,
                  background: "rgba(255, 255, 255, 0.93)",
                  color: "#333",
                  transition: "0.2s",
                  "&:hover": { transform: "scale(1.03)", boxShadow: 4 },
                  border: `2px solid ${getMetricStatus("CO₂", dashboardData.data.co2).color}`,
                  boxShadow: `0 0 10px ${getMetricStatus("CO₂", dashboardData.data.co2).color}50`,
                }}
                onClick={() => handleOpenMetricDetail(dashboardData.data.co2, "CO₂")}
              >
                <Typography variant="caption" sx={{ opacity: 0.8, color: getMetricStatus("CO₂", dashboardData.data.co2).color }}>
                  CO₂ ({getMetricStatus("CO₂", dashboardData.data.co2).level})
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: getMetricStatus("CO₂", dashboardData.data.co2).color,
                    fontWeight: "bold",
                    lineHeight: 1.2,
                  }}
                >
                  {dashboardData.data.co2} ppm
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#555",
                    mt: 0.5,
                    fontSize: 13,
                  }}
                >
                  {getMetricStatus("CO₂", dashboardData.data.co2).description}
                </Typography>
              </Card>
              {/* // Ánh sáng */}
              <Card
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 4,
                  background: "rgba(255, 255, 255, 0.93)",
                  color: "#333",
                  transition: "0.2s",
                  "&:hover": { transform: "scale(1.03)", boxShadow: 4 },
                  border: `2px solid ${getMetricStatus("Ánh sáng", dashboardData.data.light).color}`,
                  boxShadow: `0 0 10px ${getMetricStatus("Ánh sáng", dashboardData.data.light).color}50`,
                }}
                onClick={() => handleOpenMetricDetail(dashboardData.data.light, "Ánh sáng")}
              >
                <Typography variant="caption" sx={{ opacity: 0.8, color: getMetricStatus("Ánh sáng", dashboardData.data.light).color }}>
                  Ánh sáng ({getMetricStatus("Ánh sáng", dashboardData.data.light).level})
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: getMetricStatus("Ánh sáng", dashboardData.data.light).color,
                    fontWeight: "bold",
                    lineHeight: 1.2,
                  }}
                >
                  {dashboardData.data.light} lux
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#555",
                    mt: 0.5,
                    fontSize: 13,
                  }}
                >
                  {getMetricStatus("Ánh sáng", dashboardData.data.light).description}
                </Typography>
              </Card>
              {/* // Nhiệt độ không khí */}
              <Card
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 4,
                  background: "rgba(255, 255, 255, 0.93)",
                  color: "#333",
                  transition: "0.2s",
                  "&:hover": { transform: "scale(1.03)", boxShadow: 4 },
                  border: `2px solid ${getMetricStatus("Nhiệt độ không khí", dashboardData.data.air_temperature).color}`,
                  boxShadow: `0 0 10px ${getMetricStatus("Nhiệt độ không khí", dashboardData.data.air_temperature).color}50`,
                }}
                onClick={() => handleOpenMetricDetail(dashboardData.data.air_temperature, "Nhiệt độ không khí")}
              >
                <Typography variant="caption" sx={{ opacity: 0.8, color: getMetricStatus("Nhiệt độ không khí", dashboardData.data.air_temperature).color }}>
                  Nhiệt độ không khí ({getMetricStatus("Nhiệt độ không khí", dashboardData.data.air_temperature).level})
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: getMetricStatus("Nhiệt độ không khí", dashboardData.data.air_temperature).color,
                    fontWeight: "bold",
                    lineHeight: 1.2,
                  }}
                >
                  {dashboardData.data.air_temperature} °C
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#555",
                    mt: 0.5,
                    fontSize: 13,
                  }}
                >
                  {getMetricStatus("Nhiệt độ không khí", dashboardData.data.air_temperature).description}
                </Typography>
              </Card>
              {/* // Độ ẩm không khí */}
              <Card
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 4,
                  background: "rgba(255, 255, 255, 0.93)",
                  color: "#333",
                  transition: "0.2s",
                  "&:hover": { transform: "scale(1.03)", boxShadow: 4 },
                  border: `2px solid ${getMetricStatus("Độ ẩm không khí", dashboardData.data.air_humidity).color}`,
                  boxShadow: `0 0 10px ${getMetricStatus("Độ ẩm không khí", dashboardData.data.air_humidity).color}50`,
                }}
                onClick={() => handleOpenMetricDetail(dashboardData.data.air_humidity, "Độ ẩm không khí")}
              >
                <Typography variant="caption" sx={{ opacity: 0.8, color: getMetricStatus("Độ ẩm không khí", dashboardData.data.air_humidity).color }}>
                  Độ ẩm không khí ({getMetricStatus("Độ ẩm không khí", dashboardData.data.air_humidity).level})
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: getMetricStatus("Độ ẩm không khí", dashboardData.data.air_humidity).color,
                    fontWeight: "bold",
                    lineHeight: 1.2,
                  }}
                >
                  {dashboardData.data.air_humidity} °C
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#555",
                    mt: 0.5,
                    fontSize: 13,
                  }}
                >
                  {getMetricStatus("Độ ẩm không khí", dashboardData.data.air_humidity).description}
                </Typography>
              </Card>
              {/* // Độ ẩm đất*/}
              <Card
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 4,
                  background: "rgba(255, 255, 255, 0.93)",
                  color: "#333",
                  transition: "0.2s",
                  "&:hover": { transform: "scale(1.03)", boxShadow: 4 },
                  border: `2px solid ${getMetricStatus("Độ ẩm đất", dashboardData.data.soil_moisture).color}`,
                  boxShadow: `0 0 10px ${getMetricStatus("Độ ẩm đất", dashboardData.data.soil_moisture).color}50`,
                }}
                onClick={() => handleOpenMetricDetail(dashboardData.data.soil_moisture, "Độ ẩm đất")}
              >
                <Typography variant="caption" sx={{ opacity: 0.8, color: getMetricStatus("Độ ẩm đất", dashboardData.data.soil_moisture).color }}>
                  Độ ẩm đất ({getMetricStatus("Độ ẩm đất", dashboardData.data.soil_moisture).level})
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: getMetricStatus("Độ ẩm đất", dashboardData.data.soil_moisture).color,
                    fontWeight: "bold",
                    lineHeight: 1.2,
                  }}
                >
                  {dashboardData.data.soil_moisture} %
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#555",
                    mt: 0.5,
                    fontSize: 13,
                  }}
                >
                  {getMetricStatus("Độ ẩm đất", dashboardData.data.air_humidity).description}
                </Typography>
              </Card>
              {/* // Nhiệt độ đất */}
              <Card
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 4,
                  background: "rgba(255, 255, 255, 0.93)",
                  color: "#333",
                  transition: "0.2s",
                  "&:hover": { transform: "scale(1.03)", boxShadow: 4 },
                  border: `2px solid ${getMetricStatus("Nhiệt độ đất", dashboardData.data.soil_temperature).color}`,
                  boxShadow: `0 0 10px ${getMetricStatus("Nhiệt độ đất", dashboardData.data.soil_temperature).color}50`,
                }}
                onClick={() => handleOpenMetricDetail(dashboardData.data.soil_temperature, "Nhiệt độ đất")}
              >
                <Typography variant="caption" sx={{ opacity: 0.8, color: getMetricStatus("Nhiệt độ đất", dashboardData.data.soil_temperature).color }}>
                  Nhiệt độ đất ({getMetricStatus("Nhiệt độ đất", dashboardData.data.soil_temperature).level})
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: getMetricStatus("Nhiệt độ đất", dashboardData.data.soil_temperature).color,
                    fontWeight: "bold",
                    lineHeight: 1.2,
                  }}
                >
                  {dashboardData.data.soil_temperature}%
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#555",
                    mt: 0.5,
                    fontSize: 13,
                  }}
                >
                  {getMetricStatus("CO₂", dashboardData.data.co2).description}
                </Typography>
              </Card>
            </Box>


            {/* 💡 Bật/Tắt đèn */}
            <Card
              sx={{
                mt: 2,
                p: 4,
                borderRadius: 4,
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
                checked={!!dashboardData.lightStatus}
                onChange={handleToggleLight}
                disabled={isSwitchLoading}
              />
            </Card>
            {/* 💡 Bật/Tắt quạt */}
            <Card
              sx={{
                mt: 2,
                p: 4,
                borderRadius: 4,
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
                checked={!!dashboardData.fanStatus}
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
              <List dense
                sx={{
                  maxHeight: 300,         // 👈 chiều cao tối đa vùng cuộn
                  overflowY: "auto",      // 👈 bật scroll dọc
                  pr: 1,                  // padding phải nhẹ cho scrollbar
                }}>
                {alertData.map((n) => (
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
              <Box>
                <SensorChart chartData={chartData} />
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
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} sx={{ borderRadius: "8px" }}>
        <DialogTitle>Thông tin người dùng</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, width: 500, borderRadius: 4, overflow: "visible" }}>
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
          <Button onClick={handleCloseUserDialog} sx={{ borderRadius: "8px" }}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleUpdateProfile} sx={{ borderRadius: "8px" }}>
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default DashboardPage;
