import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  LockReset,
  Visibility,
  VisibilityOff,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService, handleAuthError } from '../../utils/auth';

const schema = yup.object({
  password: yup
    .string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'رمز عبور باید شامل حروف بزرگ، کوچک، عدد و کاراکتر خاص باشد'
    )
    .required('رمز عبور الزامی است'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'رمزهای عبور باید یکسان باشند')
    .required('تأیید رمز عبور الزامی است'),
});

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!token) {
      setError('لینک بازیابی رمز عبور نامعتبر است.');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('لینک بازیابی رمز عبور نامعتبر است.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.resetPassword(token, data.password);
      setSuccess(true);
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (success) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            navigate('/login', {
              state: {
                message:
                  'رمز عبور با موفقیت تغییر یافت. اکنون می‌توانید وارد شوید.',
              },
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [success, navigate]);

  if (success) {
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
              تغییر رمز عبور موفق
            </Typography>

            <Typography
              variant='body1'
              sx={{ mb: 3, color: theme.palette.text.secondary }}
            >
              رمز عبور شما با موفقیت تغییر یافت. انتقال به صفحه ورود در{' '}
              {countdown} ثانیه...
            </Typography>

            <CircularProgress size={24} />

            <Box sx={{ mt: 2 }}>
              <Button
                variant='contained'
                color='primary'
                onClick={() =>
                  navigate('/login', {
                    state: {
                      message:
                        'رمز عبور با موفقیت تغییر یافت. اکنون می‌توانید وارد شوید.',
                    },
                  })
                }
              >
                رفتن به صفحه ورود
              </Button>
            </Box>
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
            background: alpha(theme.palette.background.paper, 0.95),
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LockReset
              sx={{
                fontSize: 48,
                color: theme.palette.primary.main,
                mb: 1,
              }}
            />
            <Typography
              variant='h4'
              component='h1'
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              تغییر رمز عبور
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              لطفاً رمز عبور جدید خود را وارد کنید
            </Typography>
          </Box>

          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate>
            <Controller
              name='password'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='رمز عبور جدید'
                  type={showPassword ? 'text' : 'password'}
                  margin='normal'
                  required
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          aria-label='toggle password visibility'
                          onClick={() => setShowPassword(!showPassword)}
                          edge='end'
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                    },
                  }}
                />
              )}
            />

            <Controller
              name='confirmPassword'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='تأیید رمز عبور'
                  type={showConfirmPassword ? 'text' : 'password'}
                  margin='normal'
                  required
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          aria-label='toggle confirm password visibility'
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge='end'
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                    },
                  }}
                />
              )}
            />

            <Button
              type='submit'
              fullWidth
              variant='contained'
              disabled={loading || !isValid || !token}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8],
                },
                '&:disabled': {
                  background: theme.palette.action.disabledBackground,
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              {loading ? (
                <CircularProgress size={24} color='inherit' />
              ) : (
                'تغییر رمز عبور'
              )}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant='text'
                onClick={() => navigate('/login')}
                sx={{
                  color: theme.palette.text.secondary,
                  textDecoration: 'none',
                  '&:hover': {
                    color: theme.palette.primary.main,
                    backgroundColor: 'transparent',
                  },
                }}
              >
                بازگشت به صفحه ورود
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;
