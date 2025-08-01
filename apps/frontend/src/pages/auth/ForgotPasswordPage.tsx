import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  InputAdornment,
} from '@mui/material';
import { ArrowBack, Email, LockReset } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService, handleAuthError } from '../../utils/auth';

const schema = yup.object({
  email: yup
    .string()
    .email('آدرس ایمیل نامعتبر است')
    .required('ایمیل الزامی است'),
});

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.forgotPassword(data.email);
      setSuccess(response.message);
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 50% 50%, rgba(33, 150, 243, 0.1) 0%, transparent 50%)',
        },
      }}
    >
      <Container maxWidth='sm' sx={{ position: 'relative', zIndex: 1 }}>
        {/* Back to Login Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack sx={{ transform: 'rotateY(180deg)' }} />}
            onClick={() => navigate('/login')}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            بازگشت به ورود
          </Button>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 4,
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <LockReset sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography
              variant='h4'
              component='h1'
              sx={{
                fontWeight: 'bold',
                mb: 1,
                color: 'text.primary',
              }}
            >
              فراموشی رمز عبور
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              لطفاً ایمیل خود را وارد کنید تا لینک بازیابی ارسال شود.
            </Typography>
          </Box>

          {/* Error/Success Alert */}
          {error && (
            <Alert severity='error' sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity='success' sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Forgot Password Form */}
          <Box component='form' onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name='email'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='آدرس ایمیل'
                  type='email'
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ mb: 4 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Email sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Button
              type='submit'
              fullWidth
              variant='contained'
              size='large'
              disabled={isLoading}
              sx={{
                py: 1.5,
                mb: 3,
                background: `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.info.dark}, ${theme.palette.primary.dark})`,
                },
                '&:disabled': {
                  background: alpha(theme.palette.action.disabled, 0.3),
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'ارسال لینک بازیابی'
              )}
            </Button>
          </Box>

          {/* Footer Links */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary'>
              رمز عبور خود را به خاطر دارید؟{' '}
              <Link
                component={RouterLink}
                to='/login'
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                ورود کنید
              </Link>
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              حساب کاربری ندارید؟{' '}
              <Link
                component={RouterLink}
                to='/register'
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                ثبت نام کنید
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
