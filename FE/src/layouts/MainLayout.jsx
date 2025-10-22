// src/layouts/MainLayout.jsx

import React, { useState, useEffect } from 'react'; // 1. Thêm useEffect
import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Avatar, Box, Toolbar, Typography, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { getCurrentUser } from '../services/authService'; // 2. Import service lấy user

function MainLayout() {
    const navigate = useNavigate();
    // Khởi tạo user là null ban đầu
    const [user, setUser] = useState(null); 

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        navigate('/login');
    };

    // 3. Dùng useEffect để gọi API
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await getCurrentUser();
                // 4. SỬ DỤNG setUser để cập nhật state -> LỖI SẼ BIẾN MẤT!
                setUser(response.data); 
            } catch (error) {
                console.error("Failed to fetch user:", error);
                // Nếu token hết hạn, đá về trang login
                if (error.response?.status === 401 || error.response?.status === 403) {
                    handleLogout();
                }
            }
        };

        fetchUserData();
    }, []); // Mảng rỗng đảm bảo chỉ gọi 1 lần

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundImage: "url(/nen.png)", backgroundSize: 'cover' }}>
            <AppBar position="sticky" /* ... */ >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h5" fontWeight="bold">GREE</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Dùng optional chaining (?.) để tránh lỗi khi user còn là null */}
                        <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>{user?.name || 'Loading...'}</Typography>
                        <Avatar alt={user?.name} src={user?.avatarUrl} />
                        <IconButton color="inherit" onClick={handleClick}>
                            <MenuIcon />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                            <MenuItem onClick={() => navigate('/dashboard')}>Dashboard</MenuItem>
                            <MenuItem onClick={() => navigate('/setting')}>Setting</MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>Log out</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box component="main" sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
                <Outlet /> 
            </Box>
        </Box>
    );
}

export default MainLayout;