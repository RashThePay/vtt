import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from './prisma';

const SALT_ROUNDS = 12;
const JWT_SECRET =
  process.env.JWT_SECRET || 'fallback-secret-change-in-production';
// JWT_REFRESH_SECRET is used in refresh token verification
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  'fallback-refresh-secret-change-in-production';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m', // Access token expires in 15 minutes
  });
};

export const generateRefreshToken = async (userId: string): Promise<string> => {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    },
  });

  return refreshToken;
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = async (
  token: string
): Promise<{ valid: boolean; userId?: string }> => {
  try {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      return { valid: false };
    }

    if (refreshToken.expiresAt < new Date()) {
      // Token expired, remove it from database
      await prisma.refreshToken.delete({
        where: { id: refreshToken.id },
      });
      return { valid: false };
    }

    return { valid: true, userId: refreshToken.userId };
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    return { valid: false };
  }
};

export const revokeRefreshToken = async (token: string): Promise<boolean> => {
  try {
    await prisma.refreshToken.delete({
      where: { token },
    });
    return true;
  } catch (error) {
    console.error('Error revoking refresh token:', error);
    return false;
  }
};

export const revokeAllRefreshTokens = async (
  userId: string
): Promise<boolean> => {
  try {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return true;
  } catch (error) {
    console.error('Error revoking all refresh tokens:', error);
    return false;
  }
};

export const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    console.log('Cleaned up expired refresh tokens');
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
};
