import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Ant Design Imports
import { message } from "antd";

// Material-UI Imports
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Button,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import TextField from "@mui/material/TextField";  
import MuiTypography from "@mui/material/Typography";
import MuiDivider from "@mui/material/Divider"; 

const MOCK_USER = {
  fullName: "Username",
  gender: "Non-binary",
  dob: "January 01, 2025",
  email: "havu2845@gmail.com",
  phone: "0974546812",
  username: "Username",
  password: "********",
};

export default function AccountSettings() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const handleClickMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleLogout = () => {
    navigate("/login");
    message.success("Đăng xuất thành công!");
  };
  const handleGoToHistory = () => navigate("/history");
  const [isEditing, setIsEditing] = useState(false); // trạng thái edit hay xem
  const [userData, setUserData] = useState({
    fullName: "Username",
    gender: "Non-binary",
    dob: "January 01, 2025",
    email: "havu2845@gmail.com",
    phone: "0974546812",
    username: "Username",
    password: "********",
  });

  // Lưu thay đổi
  const handleSave = () => {
    setIsEditing(false);
  };

  // Xử lý thay đổi input
  const handleChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };



  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundImage: "url(/nen.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ---------- HEADER ---------- */}
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
            GREE
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography sx={{ display: { xs: "none", sm: "block" } }}>
              {MOCK_USER.username}
            </Typography>
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
              <MenuItem onClick={() => navigate("/settings/account")}>
                Cài đặt
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleGoToHistory}>Lịch sử</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          width: 220,
          background: "rgba(255,255,255,0.85)",
          borderRadius: 3,
          p: 2,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ mb: 3, ml: 1, color: "#000" }}
        >
          Settings
        </Typography>

        {["Account", "Alert", "Interface"].map((item, idx) => (
          <Button
            key={idx}
            startIcon={<ArrowForwardIosIcon sx={{ fontSize: 16 }} />}
            sx={{
              justifyContent: "flex-start",
              mb: 1,
              width: "100%",
              textTransform: "none",
              background:
                item === "Account"
                  ? "linear-gradient(90deg, #E3F8D3, #C2E59C)"
                  : "#E8F5E9",
              color: "#000",
              "&:hover": { backgroundColor: "#BDE0C8" },
              borderRadius: 2,
            }}
          >
            {item}
          </Button>
        ))}
      </Box>

      {/* Phần nội dung chính */}
      <Box
        sx={{
          flexGrow: 1,
          background: "rgba(255,255,255,0.85)",
          borderRadius: 3,
          p: 4,
          maxWidth: 800,
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ borderBottom: "2px solid #000", mb: 3 }}
        >
          Account Settings
        </Typography>

        {/* === BASIC INFORMATION === */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Basic Information
        </Typography>

        <Box
          sx={{
            background: "#fff",
            borderRadius: 2,
            p: 3,
            mb: 4,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ width: 56, height: 56 }} />
              <Typography>Profile picture</Typography>
            </Stack>
            {!isEditing && (
              <Box>
                <Button variant="outlined" color="error" sx={{ mr: 1 }}>
                  Delete
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => setIsEditing(true)}
                >
                  Update
                </Button>
              </Box>
            )}
          </Stack>

          {/* Danh sách thông tin */}
          {[
            { label: "Name", field: "fullName" },
            { label: "Gender", field: "gender" },
            { label: "Date of Birth", field: "dob" },
            { label: "Email", field: "email" },
            { label: "Phone Number", field: "phone" },
          ].map(({ label, field }) => (
            <InfoRow
              key={field}
              label={label}
              value={userData[field]}
              isEditing={isEditing}
              onChange={(val) => handleChange(field, val)}
            />
          ))}
        </Box>

        {/* === ACCOUNT INFORMATION === */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Account Information
        </Typography>

        <Box
          sx={{
            background: "#fff",
            borderRadius: 2,
            p: 3,
          }}
        >
          {[
            { label: "Username", field: "username" },
            { label: "Password", field: "password" },
          ].map(({ label, field }) => (
            <InfoRow
              key={field}
              label={label}
              value={userData[field]}
              isEditing={isEditing}
              onChange={(val) => handleChange(field, val)}
            />
          ))}

          {isEditing && (
            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
              <Button variant="outlined" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="contained" color="success" onClick={handleSave}>
                Save
              </Button>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}

/* --- COMPONENT CON HÀNG THÔNG TIN --- */
function InfoRow({ label, value, isEditing, onChange }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1.5,
        borderBottom: "1px solid #eee",
      }}
    >
      <Typography sx={{ fontWeight: 500 }}>{label}</Typography>
      {isEditing ? (
        <TextField
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ width: 250 }}
        />
      ) : (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ color: "#555" }}>{value}</Typography>
          <ArrowForwardIosIcon sx={{ fontSize: 14, color: "#aaa" }} />
        </Stack>
      )}
    </Box>
  );
}