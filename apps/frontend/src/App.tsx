import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store/store';
import AppLayout from './components/Layout/AppLayout';
import './App.css';

// Create MUI theme with RTL support for Persian text
const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#0a1929',
      paper: '#1e293b',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        startIcon: {
          marginRight: 'unset',
          marginLeft: '8px', // Adjust as needed
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          textAlign: 'right', // Align helper text to the right
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        icon: {
          marginRight: 'unset',
          marginLeft: '8px',
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          right: '0px',
          left: "unset",
          transformOrigin: "top right",
          transform: "translate(-13px, -8px) scale(0.75)",
          overflow: "visible",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          textAlign: "right"
        },
        notchedOutline: {
          textAlign: "right"
        },


      },
    },
  },
  typography: {
    fontFamily: [
      'Estedad',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
