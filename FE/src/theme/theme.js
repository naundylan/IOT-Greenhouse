// theme/theme.js
import createTheme from '@mui/material/styles/createTheme'

const theme = createTheme({
  palette: {
    mode: 'light', // hoặc 'dark'
    primary: {
      main: '#1976d2'
    },
    secondary: {
      main: '#9c27b0'
    }
  }
})

export default theme
