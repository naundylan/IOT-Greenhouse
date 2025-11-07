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
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { getHistoryByDate } from "../../services/historyApi";

const MOCK_USER = {
    fullName: "Username",
    gender: "Non-binary",
    dob: "January 01, 2025",
    email: "havu2845@gmail.com",
    phone: "0974546812",
    username: "Username",
    password: "********",
};
export default function HistoryPage() {
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // yyyy-mm-dd
    });
    const [data, setData] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getHistoryByDate(selectedDate);
                // Giả sử res là mảng các object như { time, temperature, humidity, light, ph, ec, co2 }
                setData(res);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu lịch sử:", err);
                setError("Không thể tải dữ liệu lịch sử, vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [selectedDate]);
    const average = (key) => (data.length ? (data.reduce((a, b) => a + b[key], 0) / data.length).toFixed(2) : 0);
    const handleExport = () => {
        alert(`Xuất báo cáo ngày ${selectedDate} (chức năng này bạn có thể nối với backend hoặc tạo file PDF).`);
    };
    ;

    const handleClickMenu = (event) => setAnchorEl(event.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);
    const handleLogout = () => {
        navigate("/login");
    };

    const handleClickHistory = () => {
        navigate("/history");
    };
    const handleClickSettings = () => {
        navigate("/settings");
    }
    const handleDashboard = () => {
        navigate("/dashboard");
        handleCloseMenu();
    }

    return (
        <Box sx={{
            backgroundImage: "url(/nen.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",

        }}>
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
                        GREEHOUSE
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography>{data.username}</Typography>
                        <Avatar />
                        <IconButton color="inherit" onClick={handleClickMenu}>
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleCloseMenu}
                        >
                            <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                            <Divider />
                            <MenuItem onClick={handleClickSettings}>Cài đặt</MenuItem>
                            <Divider />
                            <MenuItem onClick={handleClickHistory}>Lịch sử</MenuItem>
                            <Divider />
                            <MenuItem onClick={handleDashboard}>Trang chủ</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
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
            {loading && (
                <Typography sx={{ textAlign: "center", mt: 3 }}>
                    Đang tải dữ liệu...
                </Typography>
            )}
            {error && (
                <Typography color="error" sx={{ textAlign: "center", mt: 3 }}>
                    {error}
                </Typography>
            )}
            {/* --- Biểu đồ --- */}
            <Card sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Biểu đồ thông số trong ngày
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
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

                        <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#FF7300" name="Nhiệt độ KK (°C)" dot={false} />
                        <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#228B22" name="Độ ẩm KK (%)" dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="light" stroke="#E4C600" name="Ánh sáng (lux)" dot={false} />
                        <Line yAxisId="left" type="monotone" dataKey="ph" stroke="#4B8BBE" name="Độ ẩm đất" dot={false} />
                        <Line yAxisId="left" type="monotone" dataKey="ec" stroke="#9c27b0" name="Nhiệt độ đất" dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="co2" stroke="#82ca9d" name="CO₂ (ppm)" dot={false} />

                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* --- Bảng chi tiết --- */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Thống kê chi tiết {selectedDate}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Giờ</TableCell>
                                <TableCell>Nhiệt độ không khí(°C)</TableCell>
                                <TableCell>Độ ẩm không khí (%)</TableCell>
                                <TableCell>Ánh sáng (lux)</TableCell>
                                <TableCell>Độ ẩm đất(%)</TableCell>
                                <TableCell>Nhiệt độ đất(°C)</TableCell>
                                <TableCell>CO₂ (ppm)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell>{row.time}</TableCell>
                                    <TableCell>{row.temperature.toFixed(2)}</TableCell>
                                    <TableCell>{row.humidity.toFixed(2)}</TableCell>
                                    <TableCell>{row.light.toFixed(0)}</TableCell>
                                    <TableCell>{row.ph.toFixed(2)}</TableCell>
                                    <TableCell>{row.ec.toFixed(2)}</TableCell>
                                    <TableCell>{row.co2.toFixed(0)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                        Trung bình ngày:
                    </Typography>
                    <Typography>
                        🌡 {average("temperature")}°C | 💧 {average("humidity")}% | ☀️ {average("light")} lux | 💧
                        {average("ph")} % | 🌡 {average("ec")} °C | CO₂ {average("co2")} ppm
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}
