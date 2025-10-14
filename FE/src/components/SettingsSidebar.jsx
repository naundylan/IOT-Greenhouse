import React from 'react';
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';

function SettingsSidebar({ activeItem, setActiveItem }) {
    return (
        <Box sx={{ 
            width: 280, 
            flexShrink: 0, 
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 4,
            boxShadow: 1
        }}>
            <Typography variant="h5" fontWeight="bold" sx={{ p: 2 }}>Settings</Typography>
            <List component="nav">
                <ListItemButton
                    selected={activeItem === 'account'}
                    onClick={() => setActiveItem('account')}
                    sx={{ borderRadius: 2, mb: 1 }}
                >
                    <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                    <ListItemText primary="Account" />
                </ListItemButton>
                <ListItemButton
                    selected={activeItem === 'alert'}
                    onClick={() => setActiveItem('alert')}
                    sx={{ borderRadius: 2, mb: 1 }}
                >
                    <ListItemIcon><NotificationsIcon /></ListItemIcon>
                    <ListItemText primary="Alert" />
                </ListItemButton>
            </List>
        </Box>
    );
}

export default SettingsSidebar;