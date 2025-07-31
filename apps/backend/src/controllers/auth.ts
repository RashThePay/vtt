import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} from '../utils/auth';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  refreshTokenSchema,
} from '../utils/validation';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  generateVerificationToken,
  generatePasswordResetToken,
} from '../utils/email';
// Import middleware to ensure type declarations are loaded
import '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request data
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'اعتبارسنجی ناموفق بود',
        message: error.details[0].message,
        details: error.details,
      });
      return;
    }

    const { username, email, password } = value;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'ایمیل' : 'نام کاربری';
      res.status(400).json({
        error: 'کاربر از قبل وجود دارد',
        message: `کاربری با این ${field} قبلاً ثبت شده است`,
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate email verification token
    const emailVerificationToken = generateVerificationToken();

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        emailVerificationToken,
      },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(
      email,
      username,
      emailVerificationToken
    );

    if (!emailSent) {
      console.warn(`Failed to send verification email to ${email}`);
    }

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    const refreshToken = await generateRefreshToken(user.id);

    res.status(201).json({
      message: 'کاربر با موفقیت ثبت شد. لطفاً ایمیل خود را تأیید کنید.',
      user,
      token,
      refreshToken,
      emailSent,
    });
  } catch (error) {
    console.error('خطای ثبت نام:', error);
    res.status(500).json({
      error: 'خطای داخلی سرور',
      message: 'در هنگام ثبت نام خطایی رخ داد',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request data
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'اعتبارسنجی ناموفق بود',
        message: error.details[0].message,
        details: error.details,
      });
      return;
    }

    const { email, password } = value;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(400).json({
        error: 'اطلاعات ورود نامعتبر است',
        message: 'ایمیل یا رمز عبور اشتباه است',
      });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(400).json({
        error: 'اطلاعات ورود نامعتبر است',
        message: 'ایمیل یا رمز عبور اشتباه است',
      });
      return;
    }

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    const refreshToken = await generateRefreshToken(user.id);

    res.json({
      message: 'ورود موفقیت‌آمیز بود',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('خطای ورود:', error);
    res.status(500).json({
      error: 'خطای داخلی سرور',
      message: 'در هنگام ورود خطایی رخ داد',
    });
  }
};

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'غیرمجاز',
        message: 'نیاز به احراز هویت است',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        error: 'کاربر یافت نشد',
        message: 'پروفایل کاربر یافت نشد',
      });
      return;
    }

    res.json({
      user,
    });
  } catch (error) {
    console.error('خطای دریافت پروفایل:', error);
    res.status(500).json({
      error: 'خطای داخلی سرور',
      message: 'در هنگام دریافت پروفایل خطایی رخ داد',
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get refresh token from request body or headers
    const refreshToken =
      req.body.refreshToken || req.headers['x-refresh-token'];

    if (refreshToken) {
      // Revoke the refresh token
      await revokeRefreshToken(refreshToken as string);
    }

    res.json({
      message: 'خروج موفقیت‌آمیز بود',
      success: true,
    });
  } catch (error) {
    console.error('خطای خروج:', error);
    res.status(500).json({
      error: 'خطای داخلی سرور',
      message: 'در هنگام خروج خطایی رخ داد',
    });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate request data
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'اعتبارسنجی ناموفق بود',
        message: error.details[0].message,
        details: error.details,
      });
      return;
    }

    const { email } = value;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      res.json({
        message:
          'اگر ایمیل شما در سیستم موجود باشد، لینک بازیابی رمز عبور برای شما ارسال خواهد شد.',
      });
      return;
    }

    // Generate password reset token
    const resetToken = generatePasswordResetToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(
      email,
      user.username,
      resetToken
    );

    res.json({
      message:
        'اگر ایمیل شما در سیستم موجود باشد، لینک بازیابی رمز عبور برای شما ارسال خواهد شد.',
      emailSent,
    });
  } catch (error) {
    console.error('خطای بازیابی رمز عبور:', error);
    res.status(500).json({
      error: 'خطای داخلی سرور',
      message: 'در هنگام بازیابی رمز عبور خطایی رخ داد',
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate request data
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'اعتبارسنجی ناموفق بود',
        message: error.details[0].message,
        details: error.details,
      });
      return;
    }

    const { token, password } = value;

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      res.status(400).json({
        error: 'توکن نامعتبر یا منقضی',
        message: 'لینک بازیابی رمز عبور نامعتبر یا منقضی شده است.',
      });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.json({
      message:
        'رمز عبور با موفقیت تغییر یافت. اکنون می‌توانید با رمز عبور جدید وارد شوید.',
    });
  } catch (error) {
    console.error('خطای تغییر رمز عبور:', error);
    res.status(500).json({
      error: 'خطای داخلی سرور',
      message: 'در هنگام تغییر رمز عبور خطایی رخ داد',
    });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate request data
    const { error, value } = verifyEmailSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'اعتبارسنجی ناموفق بود',
        message: error.details[0].message,
        details: error.details,
      });
      return;
    }

    const { token } = value;

    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      res.status(400).json({
        error: 'توکن نامعتبر',
        message: 'لینک تأیید ایمیل نامعتبر است.',
      });
      return;
    }

    if (user.emailVerified) {
      res.json({
        message: 'ایمیل شما قبلاً تأیید شده است.',
      });
      return;
    }

    // Update user email verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });

    res.json({
      message: 'ایمیل شما با موفقیت تأیید شد.',
    });
  } catch (error) {
    console.error('خطای تأیید ایمیل:', error);
    res.status(500).json({
      error: 'خطای داخلی سرور',
      message: 'در هنگام تأیید ایمیل خطایی رخ داد',
    });
  }
};

export const resendVerificationEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'غیرمجاز',
        message: 'نیاز به احراز هویت است',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({
        error: 'کاربر یافت نشد',
        message: 'کاربر یافت نشد',
      });
      return;
    }

    if (user.emailVerified) {
      res.json({
        message: 'ایمیل شما قبلاً تأیید شده است.',
      });
      return;
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
      },
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(
      user.email,
      user.username,
      verificationToken
    );

    res.json({
      message: 'ایمیل تأیید مجدداً ارسال شد.',
      emailSent,
    });
  } catch (error) {
    console.error('خطای ارسال مجدد ایمیل تأیید:', error);
    res.status(500).json({
      error: 'خطای داخلی سرور',
      message: 'در هنگام ارسال مجدد ایمیل تأیید خطایی رخ داد',
    });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate request data
    const { error, value } = refreshTokenSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'اعتبارسنجی ناموفق بود',
        message: error.details[0].message,
        details: error.details,
      });
      return;
    }

    const { refreshToken: token } = value;

    // Verify refresh token
    const verification = await verifyRefreshToken(token);
    if (!verification.valid || !verification.userId) {
      res.status(401).json({
        error: 'توکن نامعتبر',
        message: 'توکن تازه‌سازی نامعتبر یا منقضی شده است.',
      });
      return;
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: verification.userId },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      res.status(404).json({
        error: 'کاربر یافت نشد',
        message: 'کاربر یافت نشد',
      });
      return;
    }

    // Generate new access token
    const accessToken = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    // Optionally generate new refresh token
    const newRefreshToken = await generateRefreshToken(user.id);

    // Revoke old refresh token
    await revokeRefreshToken(token);

    res.json({
      message: 'توکن با موفقیت تازه‌سازی شد',
      token: accessToken,
      refreshToken: newRefreshToken,
      user,
    });
  } catch (error) {
    console.error('خطای تازه‌سازی توکن:', error);
    res.status(500).json({
      error: 'خطای داخلی سرور',
      message: 'در هنگام تازه‌سازی توکن خطایی رخ داد',
    });
  }
};
