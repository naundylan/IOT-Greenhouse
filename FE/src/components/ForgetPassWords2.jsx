import { Link } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    InputAdornment,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import EmailIcon from '@mui/icons-material/Email';

function ForgetPassword2() {
    return (
        <>
            <Box
                sx={{
                    width: '100vw',
                    height: '100vh',
                    display: 'center',
                    backgroundImage: 'url(./public/login_bg.svg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',    /* Căn giữa hình */
                    backgroundRepeat: 'no-repeat',

                }}
            >
                {/* Bên trái: form */}
                <Box
                    sx={{
                        width: '50%',
                        backgroundColor: '#22331E',
                        backdropFilter: 'blur(2px)',//
                        display: 'flex',
                        flexDirection: 'column', // flex direction to column for form layout
                        justifyContent: 'center',// justify content to center the form
                        alignItems: 'center',
                        padding: 4,
                    }}
                >
                    <Typography color="white" gutterBottom sx={{ fontSize: '40px', mb: 3 }}>
                        Forget Password2?
                    </Typography>


                    <TextField
                        placeholder="New Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        sx={{
                            width: '568px',       // 👈 chính xác theo hình bạn đo
                            height: '72px',
                            borderRadius: '50px', // cho bo tròn như hình
                            fontSize: '20px',     // nếu muốn chữ to hơn
                            fontWeight: 'bold',
                            backgroundColor: 'white',
                            mb: 3,
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon sx={{ margin: 1 }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        placeholder="Confirm Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        sx={{
                            width: '568px',       // 👈 chính xác theo hình bạn đo
                            height: '72px',
                            borderRadius: '50px', // cho bo tròn như hình
                            fontSize: '20px',     // nếu muốn chữ to hơn
                            fontWeight: 'bold',
                            backgroundColor: 'white',
                            mb: 3,
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon sx={{ margin: 1 }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        variant="contained"
                        color="success"
                        sx={{
                            width: '568px',       // 👈 chính xác theo hình bạn đo
                            height: '72px',
                            borderRadius: '50px', // cho bo tròn như hình
                            fontSize: '20px',     // nếu muốn chữ to hơn
                            fontWeight: 'bold',
                            mb: 3,
                        }}
                    >
                        CONTINUE
                    </Button>

                    <Typography mt={2}>
                        <Link to="/login" style={{ color: '#9A9A9A', fontSize: '20px' }}>
                            Remember your account?
                        </Link>
                    </Typography>

                    <Typography mt={2}>
                        <Link to="/signin" style={{ color: '#9A9A9A', fontSize: '20px' }}>
                            Create your account <ArrowRightAltIcon fontSize="" />
                        </Link>
                    </Typography>
                </Box>


            </Box>
        </>
    );
}

export default ForgetPassword2;
