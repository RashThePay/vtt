import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
  PersonAdd,
  Email,
  Lock,
  Person,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import type { AppDispatch, RootState } from '../../store/store';

const schema = yup.object({
  username: yup
    .string()
    .min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد')
    .required('نام کاربری الزامی است'),
  email: yup
    .string()
    .email('آدرس ایمیل نامعتبر است')
    .required('ایمیل الزامی است'),
  password: yup
    .string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'رمز عبور باید حداقل شامل یک حرف بزرگ، یک حرف کوچک و یک عدد باشد'
    )
    .required('رمز عبور الزامی است'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'رمزهای عبور باید مطابقت داشته باشند')
    .required('لطفاً رمز عبور خود را تأیید کنید'),
  agreeToTerms: yup
    .boolean()
    .required()
    .oneOf([true], 'شما باید با شرایط و ضوابط موافقت کنید'),
});

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const RegisterPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  // Clear any existing errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null
  );

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, agreeToTerms, ...registerData } = data;
    const resultAction = await dispatch(registerUser(registerData));

    if (registerUser.fulfilled.match(resultAction)) {
      setSuccess('حساب کاربری با موفقیت ایجاد شد! در حال انتقال به داشبورد...');
      setRedirectCountdown(2); // seconds
    }
  };

  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0) {
      navigate('/dashboard');
    }
  }, [redirectCountdown, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(
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
            'radial-gradient(circle at 30% 20%, rgba(25, 118, 210, 0.1) 0%, transparent 50%)',
        },
      }}
    >
      <Container maxWidth='sm' sx={{ position: 'relative', zIndex: 1 }}>
        {/* Back to Home Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack sx={{ transform: 'rotateY(180deg)' }} />}
            onClick={() => navigate('/')}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            بازگشت به خانه
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
                background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <PersonAdd sx={{ fontSize: 32, color: 'white' }} />
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
              ثبت نام
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              لطفاً اطلاعات خود را وارد کنید.
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
              {redirectCountdown !== null && (
                <Typography variant='caption' sx={{ display: 'block', mt: 1 }}>
                  انتقال در {redirectCountdown} ثانیه...
                </Typography>
              )}
            </Alert>
          )}

          {/* Registration Form */}
          <Box component='form' onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name='username'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='نام کاربری'
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Person sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

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
                  sx={{ mb: 3 }}
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

            <Controller
              name='password'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='رمز عبور'
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Lock sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge='end'
                          size='small'
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
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
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Lock sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge='end'
                          size='small'
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
                />
              )}
            />

            <Controller
              name='agreeToTerms'
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      sx={{
                        color: errors.agreeToTerms
                          ? 'error.main'
                          : 'primary.main',
                      }}
                    />
                  }
                  label={
                    <Typography variant='body2' color='text.secondary'>
                      با{' '}
                      <Link
                        href='/terms'
                        sx={{
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        شرایط خدمات
                      </Link>{' '}
                      و{' '}
                      <Link
                        href='/privacy'
                        sx={{
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        سیاست حفظ حریم خصوصی
                      </Link>{' '}
                      موافقت می‌کنم
                    </Typography>
                  }
                  sx={{ mb: 3 }}
                />
              )}
            />
            {errors.agreeToTerms && (
              <Typography
                variant='caption'
                color='error'
                sx={{ display: 'block', mb: 2 }}
              >
                {errors.agreeToTerms.message}
              </Typography>
            )}

            <Button
              type='submit'
              fullWidth
              variant='contained'
              size='large'
              disabled={isLoading}
              sx={{
                py: 1.5,
                mb: 3,
                background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.primary.dark})`,
                },
                '&:disabled': {
                  background: alpha(theme.palette.action.disabled, 0.3),
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'ایجاد حساب کاربری'
              )}
            </Button>
          </Box>

          {/* Footer Links */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary'>
              قبلاً حساب کاربری دارید؟{' '}
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
                اینجا وارد شوید
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
