import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { getHistoryByDate, getExportHistoryByDate } from "../../services/historyApi";

export default function HistoryPage() {
  const navigate = useNavigate();

  // 🧠 States
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [data, setData] = useState([]);
  const [dataTable, setDataTable] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const userData = JSON.parse(localStorage.getItem("userData") || "null");
  const deviceId = "nhakinh01";

  // 📊 Fetch dữ liệu khi đổi ngày
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getHistoryByDate(deviceId, selectedDate);
        setDataTable(res);

        // Ghép dữ liệu theo 24 giờ
        const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
        const merged = hours.map((hour) => {
          const found = res.find((d) => d.time.startsWith(hour));
          return (
            found || {
              time: hour,
              light: null,
              co2: null,
              soil_moisture: null,
              soil_temperature: null,
              air_temperature: null,
              air_humidity: null,
            }
          );
        });

        setData(merged);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
        alert("Tải dữ liệu thất bại. Vui lòng thử lại sau.");
      }
    };
    fetchHistory();
  }, [selectedDate]);

  // 📈 Tính trung bình
  const average = (key) =>
    data.length
      ? (data.reduce((a, b) => a + (b[key] || 0), 0) / data.length).toFixed(2)
      : 0;

  // 📤 Xuất Excel
  const handleExport = async () => {
    try {
      const blob = await getExportHistoryByDate(deviceId, selectedDate);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `device_${deviceId}_${selectedDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("❌ Lỗi khi xuất dữ liệu:", error);
      alert("Xuất dữ liệu thất bại. Vui lòng thử lại sau.");
    }
  };

  // 🔐 Menu xử lý
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleNavigate = (path) => {
    navigate(path);
    handleCloseMenu();
  };
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        backgroundImage: "url(/nen.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        p: 2,
      }}
    >
      {/* 🌿 Navbar */}
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          background: "linear-gradient(to right, #8DB600, #2E8B57)",
          color: "white",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h5" fontWeight="bold">
            GREENHOUSE
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography>{userData?.name || "Người dùng"}</Typography>
            <Avatar />
            <IconButton color="inherit" onClick={handleMenu}>
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleCloseMenu}>
              <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
              <Divider />
              <MenuItem onClick={() => handleNavigate("/settings")}>Cài đặt</MenuItem>
              <Divider />
              <MenuItem onClick={() => handleNavigate("/history")}>Lịch sử</MenuItem>
              <Divider />
              <MenuItem onClick={() => handleNavigate("/dashboard")}>Trang chủ</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 📅 Bộ lọc ngày & nút xuất */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
        📅 Lịch sử nhà kính
      </Typography>

      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Chọn ngày"
              type="date"
              fullWidth
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={8} textAlign="right">
            <Button variant="contained" color="primary" onClick={handleExport}>
              Xuất báo cáo
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* 📊 Biểu đồ */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Biểu đồ thông số trong ngày
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 2000]} />
            <Tooltip />
            <Legend />
            {[
              { key: "air_temperature", color: "#FF7300", name: "Nhiệt độ KK (°C)" },
              { key: "air_humidity", color: "#228B22", name: "Độ ẩm KK (%)" },
              { key: "soil_moisture", color: "#4B8BBE", name: "Độ ẩm đất (%)" },
              { key: "soil_temperature", color: "#9c27b0", name: "Nhiệt độ đất (°C)" },
              { key: "co2", color: "#82ca9d", name: "CO₂ (ppm)", right: true },
              { key: "light", color: "#E4C600", name: "Ánh sáng (lux)", right: true },
            ].map(({ key, color, name, right }) => (
              <Line
                key={key}
                yAxisId={right ? "right" : "left"}
                type="monotone"
                dataKey={key}
                stroke={color}
                name={name}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 📋 Bảng thống kê */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thống kê chi tiết {selectedDate}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Table>
            <TableHead>
              <TableRow>
                {[
                  "Giờ",
                  "Nhiệt độ KK (°C)",
                  "Độ ẩm KK (%)",
                  "Ánh sáng (lux)",
                  "Độ ẩm đất (%)",
                  "Nhiệt độ đất (°C)",
                  "CO₂ (ppm)",
                ].map((col) => (
                  <TableCell key={col}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dataTable.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>{row.air_temperature?.toFixed(2)}</TableCell>
                  <TableCell>{row.air_humidity?.toFixed(2)}</TableCell>
                  <TableCell>{row.light?.toFixed(2)}</TableCell>
                  <TableCell>{row.soil_moisture?.toFixed(2)}</TableCell>
                  <TableCell>{row.soil_temperature?.toFixed(2)}</TableCell>
                  <TableCell>{row.co2?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Trung bình ngày:
          </Typography>
          <Typography>
            🌡 {average("air_temperature")}°C | 💧 {average("air_humidity")}% | ☀️{" "}
            {average("light")} lux | 💧 {average("soil_moisture")}% | 🌡{" "}
            {average("soil_temperature")}°C | CO₂ {average("co2")} ppm
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
