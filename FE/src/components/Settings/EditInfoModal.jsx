// src/components/settings/EditInfoModal.jsx

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, CircularProgress, Alert, Box
} from '@mui/material';

// Props:
// - open: Boolean to control modal visibility
// - onClose: Function to call when closing the modal
// - onSave: Async function to call when saving (passes fieldKey and newValue)
// - title: Title of the modal (e.g., "Edit Name")
// - initialValue: The current value of the field being edited
// - fieldKey: The key of the field being edited (e.g., "name", "phone")
// - loading: Boolean indicating if the save operation is in progress

function EditInfoModal({ open, onClose, onSave, title, initialValue, fieldKey, loading }) {
    const [value, setValue] = useState('');
    const [error, setError] = useState(null); // Local error for validation if needed

    // Update the local state when the initialValue prop changes (when opening for a different field)
    useEffect(() => {
        if (open) {
            setValue(initialValue || ''); // Ensure value is not null/undefined
            setError(null); // Reset local error on open
        }
    }, [open, initialValue]);

    const handleValueChange = (event) => {
        setValue(event.target.value);
        if (error) setError(null); // Clear error when user types
    };

    const handleSaveChanges = async () => {
        // Basic validation (can be expanded)
        if (!value.trim() && fieldKey !== 'gender' && fieldKey !== 'dob') { // Allow empty for certain fields if needed
            setError('This field cannot be empty.');
            return;
        }

        try {
            await onSave(fieldKey, value.trim()); // Call the save function passed from parent
            // Parent component handles closing on success
        } catch (err) {
            // Error handling is done in the parent component (AccountSettings)
            // but we could add specific modal feedback here if needed.
            console.error("Save failed in modal:", err);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {/* Display any specific validation error */}
                {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                    autoFocus // Automatically focus the input field
                    margin="dense"
                    id={fieldKey} // Use fieldKey for id
                    label="New Value"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={value}
                    onChange={handleValueChange}
                    disabled={loading} // Disable input while saving
                />
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}> {/* Standard padding */}
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Box sx={{ position: 'relative' }}> {/* Wrapper for loading indicator */}
                    <Button
                        onClick={handleSaveChanges}
                        variant="contained"
                        color="success"
                        disabled={loading || value === initialValue} // Disable if no change or loading
                    >
                        Save
                    </Button>
                    {loading && (
                        <CircularProgress
                            size={24}
                            color="success"
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-12px',
                                marginLeft: '-12px',
                            }}
                        />
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
}

export default EditInfoModal;