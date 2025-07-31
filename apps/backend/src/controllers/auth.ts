import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { registerSchema, loginSchema } from '../utils/validation';
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
        details: error.details
      });
      return;
    }

    const { username, email, password } = value;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'ایمیل' : 'نام کاربری';
      res.status(400).json({
        error: 'کاربر از قبل وجود دارد',
        message: `کاربری با این ${field} قبلاً ثبت شده است`
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    res.status(201).json({
      message: 'کاربر با موفقیت ثبت شد',
      user,
      token
    });

  } catch (error) {
    console.error('خطای ثبت نام:', error);
    res.status(500).json({
      error: 'خطای داخلی سرور',
      message: 'در هنگام ثبت نام خطایی رخ داد'
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
        details: error.details
      });
      return;
    }

    const { email, password } = value;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(400).json({
        error: 'اطلاعات ورود نامعتبر است',
        message: 'ایمیل یا رمز عبور اشتباه است'
      });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(400).json({
        error: 'اطلاعات ورود نامعتبر است',
        message: 'ایمیل یا رمز عبور اشتباه است'
      });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    res.json({
      message: 'ورود موفقیت‌آمیز بود',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error) {
    console.error('خطای ورود:', error);
    res.status(500).json({
      error: 'خطای داخلی سرور',
      message: 'در هنگام ورود خطایی رخ داد'
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'غیرمجاز',
        message: 'نیاز به احراز هویت است'
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
        updatedAt: true
      }
    });

    if (!user) {
      res.status(404).json({
        error: 'کاربر یافت نشد',
        message: 'پروفایل کاربر یافت نشد'
      });
      return;
    }

    res.json({
      user
    });

  } catch (error) {
    console.error('خطای دریافت پروفایل:', error);
    res.status(500).json({
      error: 'خطای داخلی سرور',
      message: 'در هنگام دریافت پروفایل خطایی رخ داد'
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Since we're using stateless JWT tokens, logout is mainly handled on the client side
    // However, we can still provide a logout endpoint for consistency and future token blacklisting
    
    res.json({
      message: 'خروج موفقیت‌آمیز بود',
      success: true
    });

  } catch (error) {
    console.error('خطای خروج:', error);
    res.status(500).json({
      error: 'خطای داخلی سرور',
      message: 'در هنگام خروج خطایی رخ داد'
    });
  }
};
