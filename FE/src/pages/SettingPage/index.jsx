import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Divider,
  Button,
  Stack,
  TextField,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ShareIcon from "@mui/icons-material/Share";
import { logout } from "../../services/authService";
import { getPlants, createPlant, updatePlant, deletePlant, getPreset, createPreset, updatePreset } from '../../services/alertApi'
import { SENSOR_PRESETS } from "../../constants/Preset";

export default function AccountSettings() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const handleClickMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleLogout = async () => {
    await logout ();
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
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState("Tài khoản");
  const [avatar, setAvatar] = useState(null);
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("userData")));
  const [plantData, setPlantData] = useState('');
  const [isPlantData, setIsPlantData] = useState(false);
  const [plantId, setPlantId] = useState(null);
  const [displayAlert, setDisplayAlert] = useState([]);
  const [presetId, setPresetId] = useState(null);
  useEffect(() => {
    const getPlantData = async () => {
      const data = await getPlants();
      if(data  && data.length > 0){
        setPlantData(data[0].plantName);
        setIsPlantData(true);
        setPlantId(data[0]._id);
      }
      else {
        setIsPlantData(false);
        setPlantData('');
        setPlantId(null);
      }
    }
    getPlantData();
  },[])

  useEffect(() => {
    const getPresetData = async () => {
      const setEmptyData = () => {
        const empty = SENSOR_PRESETS.map((preset) => ({...preset, min: 0, max: 0, originKey: preset.key}));
        setDisplayAlert(empty);
        setPresetId(null);
      }
      if (!plantId) {
        setEmptyData();
        return;
      }
      const res = await getPreset(plantId);
      const data = Array.isArray(res)? res[0] : null;
      if (data) {
        const formatData = SENSOR_PRESETS.map((preset) => {
          const value = data[preset.key]
          return {
            ...preset,
            min: value?.min || 0,
            max: value?.max || 0,
            originKey: preset.key
          }
        })
        setDisplayAlert(formatData);
        setPresetId(data._id);
      } else {
        setEmptyData()
      }
    }
    getPresetData();
  },[plantId])

  const handleAddNewPlant = async () => {
    if ( !plantData.trim())  return;
    try {
      const payload = {
        plantName: plantData.trim(),
        userId: userData._id
      }
      const data = await createPlant(payload)
      if (data) {
      const defaultPreset = {
        plantId: data._id,
        co2: { min: 800, max: 1200 },
        humidity: { min: 22, max: 28 },
        airTemperature: { min: 22, max: 28 },
        soilMoisture: { min: 60, max: 80 },
        soilTemperature: { min: 50, max: 70 },
        light: { min: 800, max: 1200 }
      };
      
      await createPreset(defaultPreset);
      
      // Update state - useEffect sẽ tự động load preset mới
      setPlantData(data.plantName);
      setPlantId(data._id); // ✅ Trigger useEffect load preset
      setIsPlantData(true);
    }
    } catch (error) {
      console.error("Error creating new plant:", error);
    }
  }
  const handleUpdatePlant = async () => {
    try {
      const payload = {
        plantName: plantData.trim()
      }
      await updatePlant(plantId, payload)
    } catch (error) {
      console.error("Error updating plant:", error);
    }
  }

  const onSaveUpdate = async () => {
    await handleUpdatePlant();
    setIsEditing(false);
  }

  const handleDeletePlant = async () => {
    try {
      await deletePlant(plantId);
      setPlantData('');
      setIsPlantData(false);
      setPlantId(null);
      setDisplayAlert([]);
      setPresetId(null);
    } catch (error) {
      console.error("Error deleting plant:", error);
    }
  }

  const handleUpdatePreset = (async () => {
      if (!plantId){
        alert("Điền tên của cây trồng trước");
        return;
      }
      const presetData = {};
      displayAlert.forEach((item) => {
        if (item.originKey) {
      presetData[item.originKey] = {
        min: Number(item.min), 
        max: Number(item.max)
      }
      }})
    try {
      const res = await updatePreset(presetId, presetData);
      if(res)
        alert("Cập nhật preset thành công");
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      alert("Cập nhật thất bại.");
    }
  })


  const handleSave = () => setIsEditing(false);
  const handleChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };
  const handleChangeValue = (index, field, value) => {
    setDisplayAlert(prevList => {
    return prevList.map((item, idx) => {
      if (idx === index) {
        return { 
          ...item, 
          [field]: value
        };
      }
      return item;
    });
  });
  };
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  const menuItems = [
    { label: "Tài khoản", icon: <AccountCircleIcon /> },
    { label: "Thông báo", icon: <WarningAmberIcon /> },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#fff",
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
            GREEHOUSE
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography>{userData.name}</Typography>
            <Avatar src={avatar} />
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

      {/* ---------- MAIN LAYOUT ---------- */}
      <Box sx={{ display: "flex", p: 3, gap: 3 }}>
        {/* Sidebar 4 phần */}
        <Box
          sx={{
            flex: 3,
            background: "rgba(255,255,255,0.9)",
            borderRadius: 3,
            p: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ mb: 3, textAlign: "center" }}
          >
            Cài đặt
          </Typography>

          {menuItems.map((item) => (
            <Box key={item.label} sx={{ position: "relative", width: "100%" }}>
              <Button
                startIcon={item.icon}
                fullWidth
                onClick={() => setSelected(item.label)}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  fontSize: 18,
                  fontWeight: 600,
                  mb: 2,
                  color: "#000",
                  borderRadius: 3,
                  py: 2,
                  background:
                    selected === item.label
                      ? "linear-gradient(90deg, #E3F8D3, #C2E59C)"
                      : "#E8F5E9",
                  "&:hover": {
                    background:
                      selected === item.label
                        ? "linear-gradient(90deg, #D4F3C2, #B5E09D)"
                        : "#DFF0DF",
                  },
                }}
              >
                {item.label}
              </Button>

              {selected === item.label && (
                <Box
                  sx={{
                    position: "absolute",
                    right: -10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 0,
                    height: 0,
                    borderTop: "10px solid transparent",
                    borderBottom: "10px solid transparent",
                    borderLeft: "10px solid #C2E59C",
                  }}
                />
              )}
            </Box>
          ))}
        </Box>

        {/* Content 6 phần */}
        <Box
          sx={{
            flex: 7,
            background: "rgba(255,255,255,0.9)",
            borderRadius: 3,
            p: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            backgroundImage: "url(/nen.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {selected === "Tài khoản" && (
            <>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ borderBottom: "2px solid #000", mb: 3 }}
              >
                Cài đặt tài khoản
              </Typography>

              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Thông tin cơ bản
              </Typography>

              <Box sx={{ background: "#fff", borderRadius: 2, p: 3, mb: 3 }}>
                {/* Avatar upload */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 2 }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      src={avatar}
                      sx={{ width: 70, height: 70, border: "2px solid #ccc" }}
                    />
                    <Box>
                      <Typography fontWeight="500">Ảnh đại diện</Typography>
                      <Button
                        variant="contained"
                        component="label"
                        color="success"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Cập nhật
                        <input
                          hidden
                          accept="image/*"
                          type="file"
                          onChange={handleAvatarChange}
                        />
                      </Button>
                    </Box>
                  </Stack>

                  {!isEditing && (
                    <Box>
                      <Button variant="outlined" color="error" sx={{ mr: 1, borderRadius: 2 }}>
                        Xóa
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => setIsEditing(true)}
                        sx={{ borderRadius: 2 }}
                      >
                        Cập nhật
                      </Button>
                    </Box>
                  )}
                </Stack>

                {[
                  { label: "Họ và tên", field: "displayName" },
                  { label: "Giới tính", field: "gender" },
                  { label: "Ngày sinh", field: "dob" },
                  { label: "Email", field: "email" },
                  { label: "Số điện thoại", field: "phone" },
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

              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Thông tin đăng nhập
              </Typography>

              <Box sx={{ background: "#fff", borderRadius: 2, p: 3 }}>
                {[
                  { label: "Tên người dùng", field: "name" },
                  { label: "Mật khẩu", field: "password" },
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
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="flex-end"
                    mt={2}
                  >
                    <Button variant="outlined" onClick={() => setIsEditing(false)}>
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleSave}
                    >
                      Lưu
                    </Button>
                  </Stack>
                )}
              </Box>
            </>
          )}

          {selected === "Thông báo" && (
            <Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ borderBottom: "2px solid #000", mb: 3 }}
              >
                Cài đặt thông báo
              </Typography>

              {/* STATE HOẶC LOGIC */}
              {(() => {
                return (
                  <Box>
                    {/* CHỌN CÂY */}
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }} >
                      Chọn loại cây
                    <Box display="flex" gap={1}>
                      {isPlantData ? ( 
                      <>
                      {isEditing ?
                      (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={onSaveUpdate}
                        >
                          Lưu
                        </Button>
                      ):(
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => setIsEditing(true)}
                        >
                          Sửa
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={handleDeletePlant}
                      >
                        Xóa
                      </Button>
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleAddNewPlant}
                        sx = {{ whiteSpace: 'nowrap'}}
                      >
                        Thêm mới
                      </Button>
                    )}
                    </Box>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={plantData}
                      onChange={(e) => setPlantData(e.target.value)}
                      InputProps={{
                        readOnly: isPlantData  && !isEditing, 
                      }}
                      sx={{ mb: 3, background: "#fff", borderRadius: 1 }}
                    >
                    </TextField>
                    
                    {/* DANH SÁCH THÔNG SỐ */}
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        mb: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      Danh sách cảnh báo thiết lập
                      <Button variant="contained" color="success" size="small" onClick={handleUpdatePreset}>
                        Lưu
                      </Button>
                    </Typography>

                    <Box
                      sx={{
                        maxHeight: "65vh",            // Giới hạn chiều cao khung hiển thị
                        overflowY: "auto",            // Cho phép cuộn dọc
                        pr: 1,                        // chừa khoảng tránh thanh cuộn
                        scrollbarWidth: "thin",       // Firefox
                        "&::-webkit-scrollbar": { width: "8px" },  // Chrome
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "#a5d6a7",  // màu thanh cuộn
                          borderRadius: "8px",
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        {displayAlert.map((item, index) => (
                          <Box
                            key={item.key}
                            sx={{
                              background: "#fff",
                              borderRadius: 2,
                              p: 2,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                              {item.title} Settings
                            </Typography>

                            <Box sx={{ ml: 3 }}>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                • <b>Threshold:</b> Max:{" "}
                                <TextField
                                  size="small"
                                  type="number"
                                  value={item.max}
                                  sx={{ width: 100, mx: 1 }}
                                  onChange={(e) => handleChangeValue(index, "max", e.target.value)}
                                />
                                Min:{" "}
                                <TextField
                                  size="small"
                                  type="number"
                                  value={item.min}
                                  sx={{ width: 100, mx: 1 }}
                                  onChange={(e) => handleChangeValue(index, "min", e.target.value)}
                                />{" "}
                                {item.unit}
                              </Typography>

                              <Typography variant="body2">
                                • <b>Tham số:</b> {item.type}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                  </Box>
                );
              })()}
            </Box>
          )}


        </Box>
      </Box>
    </Box>
  );
}

/* --- COMPONENT HIỂN THỊ THÔNG TIN --- */
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
          sx={{ width: 220 }}
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
