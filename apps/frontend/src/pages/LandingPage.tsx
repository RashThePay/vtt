import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    IconButton,
    useTheme,
    alpha,
    Chip,
} from '@mui/material';
import {
    PlayArrow,
    GitHub,
    Twitter,
    Chat,
    StarBorder,
    DirectionsBoat,
    Gavel,
    Store,
    Map,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const features = [
        {
            icon: <DirectionsBoat sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
            title: 'دزدان دریایی چندنفره',
            description: 'در نقش ناخدای دزدان دریایی، با سایر بازیکنان برای سلطه بر آب‌های آزاد رقابت کنید.',
        },
        {
            icon: <Gavel sx={{ fontSize: 48, color: theme.palette.secondary.main }} />,
            title: 'نبردهای تاکتیکی',
            description: 'نبردهای دریایی هیجان‌انگیز با سیستم فازهای توپخانه‌ای و عرشه‌ای.',
        },
        {
            icon: <Store sx={{ fontSize: 48, color: theme.palette.success.main }} />,
            title: 'تجارت و استراتژی',
            description: 'کشتی‌سازی، تجارت پویا، و مدیریت خدمه در دنیایی پر از خطر.',
        },
        {
            icon: <Map sx={{ fontSize: 48, color: theme.palette.info.main }} />,
            title: 'اکتشاف جزایر',
            description: 'جزایر مرموز، گنج‌های پنهان، و ماموریت‌های متنوع در انتظار شماست.',
        },
    ];

    const stats = [
        { number: '۲۰+', label: 'دزدان دریایی فعال' },
        { number: '۵+', label: 'کمپین در حال اجرا' },
        { number: '۴', label: 'نواحی دریایی' },
        { number: '۱۰۰%', label: 'خطر و هیجان' },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    
                    backgroundImage: 'url(/images/hero.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', py: 8 ,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 30% 20%, rgba(25, 118, 210, 0.1) 0%, transparent 50%)',
                    },
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1,  }}>
                    {/* Navigation */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 3,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    🏴‍☠️
                                </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                آب‌های آزاد
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/login')}
                                sx={{
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                        borderColor: theme.palette.primary.light,
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    },
                                }}
                            >
                                ورود
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/register')}
                                sx={{
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    '&:hover': {
                                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                                    },
                                }}
                            >
                                شروع کنید
                            </Button>
                        </Box>
                    </Box>

                    {/* Hero Content */}
                    <Box sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
                        <Chip
                            label="⚡ نسخه‌ی بتا"
                            sx={{
                                mb: 4,
                                backgroundColor: alpha(theme.palette.primary.main, 0.9),
                                color: theme.palette.text.primary,
                                fontWeight: 'bold',
                            }}
                        />
                        <Typography
                            variant="h2"
                            component="h1"
                            sx={{
                                fontWeight: 'bold',
                                WebkitTextStrokeColor: theme.palette.text.primary,
                                WebkitTextStrokeWidth: '1px',
                                mb: 3,
                                background: theme.palette.text.primary,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                            }}
                        >
                            آب‌های آزاد
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                mb: 4,
                                color: 'text.secondary',
                                maxWidth: '600px',
                                mx: 'auto',
                                lineHeight: 1.6,
                            }}
                        >
                            در نقش ناخدای دزدان دریایی، کشتی و خدمه خود را هدایت کنید.
                            با سایر بازیکنان برای کسب ثروت، شهرت و قدرت در دریاها رقابت کنید.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<PlayArrow />}
                                onClick={() => navigate('/register')}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    '&:hover': {
                                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                                        transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                ناخدا شو
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={<StarBorder />}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                        borderColor: theme.palette.primary.light,
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                قوانین بازی
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Stats Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Grid container spacing={4}>
                    {stats.map((stat, index) => (
                        <Grid item xs={6} md={3} key={index}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: theme.palette.primary.main,
                                        mb: 1,
                                    }}
                                >
                                    {stat.number}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {stat.label}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Features Section */}
            <Box sx={{ bgcolor: alpha(theme.palette.background.paper, 0.5), py: 10 }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            textAlign: 'center',
                            mb: 2,
                            fontWeight: 'bold',
                            color: 'text.primary',
                        }}
                    >
                        چرا آب‌های آزاد را انتخاب کنید؟
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            textAlign: 'center',
                            mb: 8,
                            color: 'text.secondary',
                            maxWidth: '600px',
                            mx: 'auto',
                        }}
                    >
                        بازی استراتژیک چندنفره‌ای که ترکیبی از استراتژی، نقش‌آفرینی و رقابت است
                    </Typography>
                    <Grid container spacing={4}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} md={6} lg={3} key={index}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        background: alpha(theme.palette.background.paper, 0.8),
                                        backdropFilter: 'blur(10px)',
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
                                            borderColor: alpha(theme.palette.primary.main, 0.3),
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                        <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                            {feature.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box sx={{ py: 10 }}>
                <Container maxWidth="md">
                    <Box
                        sx={{
                            textAlign: 'center',
                            p: 6,
                            borderRadius: 4,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
                                theme.palette.secondary.main,
                                0.1
                            )} 100%)`,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                mb: 3,
                                fontWeight: 'bold',
                                color: 'text.primary',
                            }}
                        >
                            آماده‌ی حکمرانی بر دریاها هستید؟
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 4,
                                color: 'text.secondary',
                                maxWidth: '500px',
                                mx: 'auto',
                            }}
                        >
                            به دزدان دریایی بپیوندید که برای کسب ثروت، شهرت و قدرت در آب‌های آزاد می‌جنگند.
                            کشتی خود را بسازید، خدمه جمع کنید و سفر خود را آغاز کنید.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/register')}
                            sx={{
                                px: 6,
                                py: 2,
                                fontSize: '1.2rem',
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                '&:hover': {
                                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            پرچم سیاه را برافرازید
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    py: 6,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
            >
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 4,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    VTT
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                © 2024 آب‌های آزاد VTT. تمامی حقوق محفوظ است.
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                <GitHub />
                            </IconButton>
                            <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                <Twitter />
                            </IconButton>
                            <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                <Chat />
                            </IconButton>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default LandingPage;
