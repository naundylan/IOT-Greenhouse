import React from 'react';
import { Box, Typography, Avatar, Stack, Divider, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Component con cho từng dòng thông tin
const SettingsRow = ({ label, value }) => (
    <>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 2 }}>
            <Typography variant="body1">{label}</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body1" color="text.secondary">{value}</Typography>
                <IconButton size="small"><ChevronRightIcon /></IconButton>
            </Stack>
        </Stack>
        <Divider />
    </>
);

function AccountSettings() {
    // Dữ liệu giả, sau này sẽ lấy từ state/API
    const userInfo = {
        name: 'Username',
        gender: 'Non-binary',
        dob: 'January 01, 2025',
        email: 'havu2845@gmail.com',
        phone: '0974546812',
        username: 'Username',
    };

    return (
        <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', p: 3, borderRadius: 4, boxShadow: 1 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>Account Settings</Typography>
            
            <Typography variant="h6" sx={{ mt: 3 }}>Basic Information</Typography>
            <Divider />
            <Stack direction="row" alignItems="center" spacing={2} sx={{ my: 2 }}>
                <Avatar sx={{ width: 64, height: 64 }} />
                <Typography>Profile picture</Typography>
            </Stack>
            <Divider />
            
            <SettingsRow label="Name" value={userInfo.name} />
            <SettingsRow label="Gender" value={userInfo.gender} />
            <SettingsRow label="Date of Birth" value={userInfo.dob} />
            <SettingsRow label="Email" value={userInfo.email} />
            <SettingsRow label="Phone Number" value={userInfo.phone} />

            <Typography variant="h6" sx={{ mt: 4 }}>Account Information</Typography>
            <Divider />
            <SettingsRow label="Username" value={userInfo.username} />
            <SettingsRow label="Password" value="••••••••••" />
        </Box>
    );
}

export default AccountSettings;