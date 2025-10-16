import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import SettingsSidebar from '../../components/SettingsSidebar';
import AccountSettings from '../../components/Settings/AccountSettings';
// import AlertSettings from '../../components/AlertSettings'; // Component cho tương lai

function SettingPage() {
    const [activeItem, setActiveItem] = useState('account');

    // Hàm render nội dung tương ứng
    const renderContent = () => {
        switch (activeItem) {
            case 'account':
                return <AccountSettings />;
            case 'alert': 
                return <p>Alert Settings Page</p>; // Placeholder
            default:
                return <AccountSettings />;
        }
    };

    return (
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
            <SettingsSidebar activeItem={activeItem} setActiveItem={setActiveItem} />
            <Box sx={{ width: '100%' }}>
                {renderContent()}
            </Box>
        </Box>
    );
}

export default SettingPage;