import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ExitToApp,
  Add,
  Group,
  Settings,
  Dashboard,
  Home,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { type AppDispatch } from '../store/store';

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
    } catch (error) {
      // Even if there's an error, we still navigate to home
      // since the local storage should be cleared
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth='lg' sx={{ py: 4 }}>
        {/* Header */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Dashboard
                sx={{ fontSize: 32, color: theme.palette.primary.main }}
              />
              <Box>
                <Typography
                  variant='h4'
                  sx={{ fontWeight: 'bold', color: 'text.primary' }}
                >
                  خوش آمدید، کاپیتان!
                </Typography>
                <Typography variant='body1' sx={{ color: 'text.secondary' }}>
                  این داشبورد شماست.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant='outlined'
                startIcon={<Home />}
                onClick={() => navigate('/')}
                sx={{
                  color: 'primary.main',
                  borderColor: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                صفحه اصلی
              </Button>
              <Button
                variant='outlined'
                startIcon={<ExitToApp />}
                onClick={handleLogout}
                sx={{
                  borderColor: theme.palette.error.main,
                  color: theme.palette.error.main,
                  '&:hover': {
                    borderColor: theme.palette.error.dark,
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                  },
                }}
              >
                خروج
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
                },
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Add
                  sx={{
                    fontSize: 48,
                    color: theme.palette.primary.main,
                    mb: 2,
                  }}
                />
                <Typography variant='h6' sx={{ mb: 1, fontWeight: 'bold' }}>
                  ایجاد کمپین
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  یک ماجراجویی جدید را شروع کنید
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 20px 40px ${alpha(theme.palette.secondary.main, 0.1)}`,
                },
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Group
                  sx={{
                    fontSize: 48,
                    color: theme.palette.secondary.main,
                    mb: 2,
                  }}
                />
                <Typography variant='h6' sx={{ mb: 1, fontWeight: 'bold' }}>
                  پیوستن به جلسه
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  با دوستان خود ارتباط برقرار کنید
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 20px 40px ${alpha(theme.palette.success.main, 0.1)}`,
                },
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Settings
                  sx={{
                    fontSize: 48,
                    color: theme.palette.success.main,
                    mb: 2,
                  }}
                />
                <Typography variant='h6' sx={{ mb: 1, fontWeight: 'bold' }}>
                  تنظیمات
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  تجربه خود را سفارشی کنید
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Paper
          sx={{
            p: 4,
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Typography variant='h5' sx={{ mb: 3, fontWeight: 'bold' }}>
            فعالیت‌های اخیر
          </Typography>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant='h6' color='text.secondary' sx={{ mb: 2 }}>
              هیچ فعالیتی اخیر نیست
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              برای دیدن فعالیت‌ها، اولین کمپین خود را شروع کنید
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default DashboardPage;
