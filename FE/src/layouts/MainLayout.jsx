import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Avatar, Box, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Divider from '@mui/material/Divider';
// Component này là khung sườn cho các trang sau khi đăng nhập
function MainLayout() {
    const navigate = useNavigate();
    const [user, setUser] =  React.useState({ name: 'Username' });

    // Logic cho menu dropdown trên AppBar
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f4f6f8' }}>
            {/* AppBar chung cho toàn bộ layout */}
            <AppBar position="fixed" elevation={1} sx={{ 
                background: "linear-gradient(to right, #97B067, #437057)", 
                color: "white",
                zIndex: (theme) => theme.zIndex.drawer + 1 
            }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h5" fontWeight="bold">GREE</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>{user.name}</Typography>
                        <Avatar alt={user.name} src={user.avatarUrl} />
                        <IconButton color="inherit" onClick={handleClick}>
                            <MenuIcon />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                            <MenuItem onClick={() => navigate('/dashboard')}>Dashboard</MenuItem>
                            <MenuItem onClick={() => navigate('/setting')}>Setting</MenuItem>
                            <MenuItem onClick={() => navigate('/history')}>History</MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>Log out</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Vùng nội dung chính của các trang con */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '64px' /* chiều cao AppBar */ }}>
                <Outlet /> {/* Đây là nơi các component con (Dashboard, Setting) sẽ được render */}
            </Box>
        </Box>
    );
}

export default MainLayout;