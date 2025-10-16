import React, { useState } from 'react';
import { Typography, Stack, Switch, Divider } from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ModeFanOffOutlinedIcon from '@mui/icons-material/ModeFanOffOutlined';
import { Card } from '../common/StyledComponents';

// Component con cho từng dòng điều khiển, giúp code gọn hơn
function DeviceItem({ icon, label, checked, onChange }) {
    return (
        <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ width: '100%', py: 1 }}
        >
            <Stack direction="row" alignItems="center" gap={2}>
                {icon}
                <Typography fontWeight={500}>{label}</Typography>
            </Stack>
            <Switch checked={checked} onChange={onChange} color="success" />
        </Stack>
    );
}

function DeviceControlPanel() {
    // State giả lập trạng thái của các thiết bị (on/off)
    const [lightsOn, setLightsOn] = useState(false);
    const [fanOn, setFanOn] = useState(true);

    const handleToggleLights = () => {
        setLightsOn(prev => !prev);
        // TODO: Gọi API để bật/tắt đèn thật ở đây
        console.log("Đèn đã được chuyển sang trạng thái:", !lightsOn);
    };

    const handleToggleFan = () => {
        setFanOn(prev => !prev);
        // TODO: Gọi API để bật/tắt quạt thật ở đây
        console.log("Quạt đã được chuyển sang trạng thái:", !fanOn);
    };

    return (
        // Dùng Card đã styled để làm nền
        <Card>
            <Stack spacing={1}>
                <Typography variant="h6" fontWeight="bold">Bảng Điều Khiển Thiết Bị</Typography>
                <Divider sx={{ my: 1 }} />
                
                <DeviceItem 
                    icon={<LightbulbOutlinedIcon color={lightsOn ? "success" : "action"} />}
                    label="Hệ thống đèn"
                    checked={lightsOn}
                    onChange={handleToggleLights}
                />
                
                <Divider variant="middle" sx={{ my: 0.5 }} />

                <DeviceItem 
                    icon={<ModeFanOffOutlinedIcon color={fanOn ? "success" : "action"} />}
                    label="Quạt thông gió"
                    checked={fanOn}
                    onChange={handleToggleFan}
                />
            </Stack>
        </Card>
    );
}

export default DeviceControlPanel;