// src/layouts/MainLayout.jsx

import React, { useState, useEffect, useCallback } from 'react'; // ✅ Đã import useCallback
import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Avatar, Box, Toolbar, Typography, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { getCurrentUser } from '../services/authService';

function MainLayout() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); 

    // ✅ Sửa lại cho nhất quán
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    // ✅ Bọc handleLogout bằng useCallback để nó không bị tạo lại mỗi lần render
    const handleLogout = useCallback(() => {
        localStorage.removeItem('userToken');
        navigate('/login', { replace: true });
    }, [navigate]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await getCurrentUser();
                setUser(response.data); 
            } catch (error) {
                console.error("Failed to fetch user:", error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    // Tự động đăng xuất nếu token không hợp lệ
                    handleLogout();
                }
            }
        };

        fetchUserData();
    }, [handleLogout]); // ✅ Thêm handleLogout vào mảng phụ thuộc

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100vh', 
            backgroundImage: "url(/nen.png)", 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed' // ✅ Giữ ảnh nền cố định khi cuộn
        }}>
            <AppBar position="sticky" elevation={1} sx={{ background: "linear-gradient(to right, #97B067, #437057)", color: "white" }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h5" fontWeight="bold">GREE</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>{user?.name || 'Loading...'}</Typography>
                        <Avatar alt={user?.name} src={user?.avatarUrl} />
                        <IconButton color="inherit" onClick={handleClick}>
                            <MenuIcon />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                            <MenuItem onClick={() => { navigate('/setting'); handleClose(); }}>Cài Đặt</MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, overflowY: 'auto' }}>
                <Outlet /> 
            </Box>
        </Box>
    );
}

export default MainLayout;