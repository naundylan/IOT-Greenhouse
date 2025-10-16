import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton,
    Typography, Stack, Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Component con cho từng mức độ
function StatusLevelItem({ color, level, range, description }) {
    return (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2, borderBottom: '1px solid #eee' }}>
            <Box sx={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
            <Box>
                <Typography variant="body1" fontWeight="bold">
                    {level}: <Typography component="span" color="text.secondary">{range}</Typography>
                </Typography>
                <Typography variant="body2">{description}</Typography>
            </Box>
        </Stack>
    );
}

function StatusLevelModal({ open, onClose, metric, levels }) {
    // Nếu không có metric hoặc levels, không render gì cả
    if (!metric || !levels) {
        return null;
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                {metric.icon}
                <Typography variant="h6" component="span" sx={{ ml: 1.5 }}>
                    Mức Độ Trạng Thái: {metric.label}
                </Typography>
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
                {/* Lặp qua dữ liệu các mức độ và hiển thị */}
                {levels.map((item, index) => (
                    <StatusLevelItem key={index} {...item} />
                ))}
            </DialogContent>
        </Dialog>
    );
}

export default StatusLevelModal;