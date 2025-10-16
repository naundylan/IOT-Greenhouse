import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

// Logic định nghĩa style được chuyển hoàn toàn vào đây
const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '50px',
        backgroundColor: 'white',
        height: '72px',
        '& fieldset': {
            border: 'none',
        },
        '&:hover fieldset': {
            border: '2px solid #66bb6a',
        },
        '&.Mui-focused fieldset': {
            border: '2px solid #388e3c',
        },
    },
    '& .MuiInputBase-input': {
        fontSize: '18px',
        fontWeight: '500',
        paddingLeft: theme.spacing(1),
    },
}));
export default StyledTextField;