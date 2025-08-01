import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import { Error, CheckCircle } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService, handleAuthError } from '../../utils/auth';

const VerifyEmailPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('لینک تأیید ایمیل نامعتبر است.');
        setLoading(false);
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setMessage(response.message);
        setSuccess(true);
      } catch (err) {
        setError(handleAuthError(err));
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  const handleResendVerification = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.resendVerificationEmail();
      setMessage(response.message);
      setSuccess(true);
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container component='main' maxWidth='sm'>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          }}
        >
          <Paper
            elevation={8}
            sx={{
              padding: 4,
              borderRadius: 3,
              width: '100%',
              maxWidth: 480,
              textAlign: 'center',
              background: alpha(theme.palette.background.paper, 0.95),
            }}
          >
            <CircularProgress size={64} sx={{ mb: 2 }} />
            <Typography variant='h5' component='h1' gutterBottom>
              در حال تأیید ایمیل...
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component='main' maxWidth='sm'>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            padding: 4,
            borderRadius: 3,
            width: '100%',
            maxWidth: 480,
            textAlign: 'center',
            background: alpha(theme.palette.background.paper, 0.95),
          }}
        >
          {success ? (
            <>
              <CheckCircle
                sx={{
                  fontSize: 64,
                  color: theme.palette.success.main,
                  mb: 2,
                }}
              />

              <Typography
                variant='h4'
                component='h1'
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                تأیید ایمیل موفق
              </Typography>

              <Typography
                variant='body1'
                sx={{ mb: 3, color: theme.palette.text.secondary }}
              >
                {message}
              </Typography>

              <Button
                variant='contained'
                size='large'
                onClick={() => navigate('/dashboard')}
                sx={{
                  mt: 2,
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                ورود به داشبورد
              </Button>
            </>
          ) : (
            <>
              <Error
                sx={{
                  fontSize: 64,
                  color: theme.palette.error.main,
                  mb: 2,
                }}
              />

              <Typography
                variant='h4'
                component='h1'
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                خطا در تأیید ایمیل
              </Typography>

              {error && (
                <Alert severity='error' sx={{ mb: 3, textAlign: 'right' }}>
                  {error}
                </Alert>
              )}

              <Typography
                variant='body1'
                sx={{ mb: 3, color: theme.palette.text.secondary }}
              >
                اگر عضو سایت هستید، می‌توانید درخواست ارسال مجدد ایمیل تأیید
                دهید.
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant='outlined'
                  onClick={handleResendVerification}
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    px: 3,
                    fontSize: '1rem',
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4],
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    'ارسال مجدد ایمیل تأیید'
                  )}
                </Button>

                <Button
                  variant='text'
                  onClick={() => navigate('/login')}
                  sx={{
                    py: 1.5,
                    px: 3,
                    fontSize: '1rem',
                    borderRadius: 2,
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.primary.main,
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  بازگشت به ورود
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmailPage;
