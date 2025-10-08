import React from "react";
import {
  AppBar, Avatar, Box, Divider, List, ListItem,
  ListItemIcon, ListItemText, Paper, Toolbar, Typography, Stack, IconButton
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import HomeIcon from "@mui/icons-material/Home";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import OpacityIcon from "@mui/icons-material/Opacity";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import ScienceIcon from "@mui/icons-material/Science";
import Co2Icon from "@mui/icons-material/Co2";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const Card = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  height: "100%",
  padding: theme.spacing(2),
  background: "rgba(255,255,255,0.92)",
  boxShadow: "0 8px 24px rgba(0,0,0,.06)",
}));

const InfoCard = styled(Card)(({ theme }) => ({
  color: theme.palette.common.white,
  background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 50%, ${theme.palette.success.light} 100%)`,
}));

// thay toàn bộ Dot cũ bằng đoạn này
const Dot = styled('span', {
  shouldForwardProp: (prop) => prop !== 'dotcolor',
})(({ dotcolor }) => ({
  width: 10,              // đừng để 100%
  height: 10,             // đừng để 100%
  borderRadius: '50%',
  backgroundColor: dotcolor || '#4caf50',
  display: 'inline-block',
  marginRight: 8,
}));


function Metric({ icon, label, value }) {
  return (
    <Card elevation={0} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: 44, height: 44, borderRadius: "50%",
          display: "grid", placeItems: "center",
          bgcolor: "rgba(46,125,50,.08)", color: "#2e7d32", flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>{label}</Typography>
        <Typography variant="h6" sx={{ color: "#2e7d32", lineHeight: 1.1 }}>{value}</Typography>
      </Box>
    </Card>
  );
}

function Dashboard() {
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
  };

  const chartData = [
    { time: "02:00", nhietdodat: 27, doamdat: 35, anhsang: 2000, nhietdokk: 20, doamkk: 50, co2: 800 },
    { time: "04:00", nhietdodat: 26, doamdat: 65, anhsang: 2000, nhietdokk: 25, doamkk: 60, co2: 900 },
    { time: "06:00", nhietdodat: 25, doamdat: 68, anhsang: 3000, nhietdokk: 30, doamkk: 70, co2: 800 },
    { time: "08:00", nhietdodat: 26, doamdat: 70, anhsang: 6000, nhietdokk: 30, doamkk: 60, co2: 850 },
    { time: "10:00", nhietdodat: 28, doamdat: 68, anhsang: 7000, nhietdokk: 28, doamkk: 50, co2: 870},
    { time: "12:00", nhietdodat: 32, doamdat: 62, anhsang: 10000, nhietdokk: 34, doamkk: 40, co2:1200 },
    { time: "14:00", nhietdodat: 35, doamdat: 70, anhsang: 9000, nhietdokk: 37, doamkk: 50, co2: 1150 },
    { time: "16:00", nhietdodat: 30, doamdat: 64, anhsang: 8000, nhietdokk: 34, doamkk: 70, co2: 1152 },
    { time: "18:00", nhietdodat: 25, doamdat: 72, anhsang: 6000, nhietdokk: 30, doamkk: 80, co2: 860 },
    { time: "20:00", nhietdodat: 24, doamdat: 75, anhsang: 6000, nhietdokk: 25, doamkk: 90, co2: 750 },
    { time: "22:00", nhietdodat: 27, doamdat: 78, anhsang: 3000, nhietdokk: 22, doamkk: 70, co2: 700 },
    { time: "24:00", nhietdodat: 28, doamdat: 80, anhsang: 3000, nhietdokk: 20, doamkk: 60, co2: 700},
  ];

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
      {/* APPBAR */}
      <AppBar position="sticky" elevation={0} sx={{ background: "linear-gradient(to right, #97B067, #437057)" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h5">GREE</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton color="inherit"><NotificationsNoneIcon /></IconButton>
            <Typography>USERNAME</Typography>
            <Avatar />
            <IconButton color="inherit"><MenuIcon /></IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* MAIN – 2 BLOCK */}
      <Box sx={{ flex: 1, px: { xs: 1, md: 2 }, py: 2, position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "grid",                                  // ⟵ dùng Grid thay vì Flex
            gridTemplateColumns: { xs: "1fr", md: '1.5fr 1fr' }, // ⟵ 2 cột chính
            gap: 3,
            alignItems: "start",
            minHeight: 0,
            padding: 8,
          }}
        >
          {/* BLOCK TRÁI: Thông tin + 6 chỉ số */}
          <InfoCard elevation={0} sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <HomeIcon />
                <Typography variant="h4" fontWeight={700}>{greenhouseData.name}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <LocalFloristIcon />
                <Typography variant="h6">{greenhouseData.plant}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Dot dotColor="#4caf50" />
                <Typography variant="h6">Trạng thái: {greenhouseData.status}</Typography>
              </Stack>

              <Divider sx={{ opacity: .3, my: 1 }} />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" },
                  gap: 6,
                  alignItems: "center",

                }}
              >
                {greenhouseData.metrics.map((m) => (
                  <Metric key={m.id} {...m} />
                ))}
              </Box>
            </Stack>
          </InfoCard>

          {/* BLOCK PHẢI: Thông báo + Biểu đồ */}
          {/* BLOCK PHẢI: Thông báo + Biểu đồ */}
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
                    <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
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
    </Box>
  );
}

export default Dashboard;
