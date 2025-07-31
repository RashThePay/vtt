import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
          theme.palette.secondary.main,
          0.05
        )} 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(25, 118, 210, 0.1) 0%, transparent 50%)',
        },
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '4rem', md: '8rem' },
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          404
        </Typography>
        <Typography variant="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          صفحه پیدا نشد
        </Typography>
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            fontWeight: 'bold',
            color: 'text.primary',
          }}
        >
          گم شده در دریا
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mb: 4,
            color: 'text.secondary',
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          صفحه‌ای که به دنبال آن هستید وجود ندارد.
          بیایید شما را به سرزمین‌های آشنا برگردانیم.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{
              px: 4,
              py: 1.5,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              },
            }}
          >
            بازگشت به خانه
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{
              px: 4,
              py: 1.5,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.light,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            بازگشت
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFoundPage;
