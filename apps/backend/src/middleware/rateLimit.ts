import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Custom rate limiter for auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    error: 'درخواست‌های زیاد',
    message:
      'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً پس از ۱۵ دقیقه مجدداً تلاش کنید.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'درخواست‌های زیاد',
      message:
        'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً پس از ۱۵ دقیقه مجدداً تلاش کنید.',
      retryAfter: '15 minutes',
    });
  },
});

// Rate limiter for password reset requests
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    error: 'درخواست‌های زیاد',
    message:
      'تعداد درخواست‌های بازیابی رمز عبور شما بیش از حد مجاز است. لطفاً پس از ۱ ساعت مجدداً تلاش کنید.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'درخواست‌های زیاد',
      message:
        'تعداد درخواست‌های بازیابی رمز عبور شما بیش از حد مجاز است. لطفاً پس از ۱ ساعت مجدداً تلاش کنید.',
      retryAfter: '1 hour',
    });
  },
});

// Rate limiter for email verification requests
export const emailVerificationRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // limit each IP to 3 email verification requests per 10 minutes
  message: {
    error: 'درخواست‌های زیاد',
    message:
      'تعداد درخواست‌های تأیید ایمیل شما بیش از حد مجاز است. لطفاً پس از ۱۰ دقیقه مجدداً تلاش کنید.',
    retryAfter: '10 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'درخواست‌های زیاد',
      message:
        'تعداد درخواست‌های تأیید ایمیل شما بیش از حد مجاز است. لطفاً پس از ۱۰ دقیقه مجدداً تلاش کنید.',
      retryAfter: '10 minutes',
    });
  },
});

// General API rate limiter
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'درخواست‌های زیاد',
    message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'درخواست‌های زیاد',
      message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید.',
      retryAfter: '15 minutes',
    });
  },
});
