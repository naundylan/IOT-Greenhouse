import { Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

function LoginPage() {
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
            width: '40%',               // Chiếm 40% chiều rộng
            backgroundColor: '#22331E',
            backdropFilter: 'blur(2px)',//
            display: 'flex',
            flexDirection: 'column', // flex direction to column for form layout
            justifyContent: 'center',// justify content to center the form
            alignItems: 'center',
            padding: 4,
          }}
        >
          <Typography color="white" gutterBottom sx={{ fontSize: '40px', marginBottom: 3 }}>
            User Login
          </Typography>

          <TextField
            placeholder="Username"
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
              overflow: 'auto',
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ margin: 1 }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            placeholder="Password"
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
              mb: 6,
              overflow: 'auto',
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
            <Typography>
            <Link to="/dashboard" style={{ color: 'white',fontSize: '20px' }}>
              LogIn
            </Link>
            </Typography>
          </Button>

            <Typography mt={2} >
              <Link to="/signin" style={{ color: '#9A9A9A', fontSize: '20px' }} sx={{}}>
                Create your Account <ArrowRightAltIcon fontSize="lagre" />
              </Link>
            </Typography>

            <Typography mt={2}>
              <Link to="/forgetpassword" style={{ color: '#9A9A9A', fontSize: '20px' }}>
                Forgot Password?
              </Link>
            </Typography>

        </Box>
      </Box >
    </>
  );
}

export default LoginPage;
