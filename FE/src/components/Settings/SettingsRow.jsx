// src/components/settings/SettingsRow.jsx

import React from 'react';
import { Box, Typography, Stack, Divider, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Props:
// - label: The text label (e.g., "Name")
// - value: The current value to display (e.g., "Username")
// - onClick: Function to call when the row is clicked (if editable)
// - isLast: Boolean to indicate if this is the last row (to omit the bottom divider)

function SettingsRow({ label, value, onClick, isLast = false }) {
    const isEditable = !!onClick; // Check if onClick function is provided

    return (
        <>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                    py: 1.5, // Vertical padding
                    px: 1, // Horizontal padding
                    cursor: isEditable ? 'pointer' : 'default', // Change cursor if clickable
                    '&:hover': isEditable ? { bgcolor: 'action.hover' } : {}, // Highlight on hover if clickable
                    borderRadius: 1, // Slight rounding
                }}
                onClick={isEditable ? onClick : undefined} // Only attach onClick if editable
            >
                <Typography sx={{ minWidth: '120px', color: 'text.secondary' }}> {/* Label color */}
                    {label}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography sx={{ color: 'text.primary', textAlign: 'right' }}> {/* Value color */}
                        {value}
                    </Typography>
                    {isEditable && (
                        <IconButton size="small" edge="end" sx={{ color: 'text.disabled' }}> {/* Arrow color */}
                            <ChevronRightIcon />
                        </IconButton>
                    )}
                </Stack>
            </Stack>
            {!isLast && <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }} />} {/* Lighter divider */}
        </>
    );
}

export default SettingsRow;