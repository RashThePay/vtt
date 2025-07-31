import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('SMTP server is ready to take our messages');
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error);
    return false;
  }
};

// Generate verification token
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate password reset token
export const generatePasswordResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Send email verification
export const sendVerificationEmail = async (
  email: string,
  username: string,
  token: string
): Promise<boolean> => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"آب‌های آزاد VTT" <${process.env.SMTP_FROM || 'noreply@example.com'}>`,
      to: email,
      subject: 'تأیید ایمیل - آب‌های آزاد VTT',
      html: `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1976d2; text-align: center;">خوش آمدید به آب‌های آزاد VTT</h2>
          
          <p>سلام ${username} عزیز،</p>
          
          <p>برای تکمیل فرآیند ثبت نام، لطفاً ایمیل خود را تأیید کنید.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #1976d2; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              تأیید ایمیل
            </a>
          </div>
          
          <p>یا می‌توانید لینک زیر را در مرورگر خود کپی کنید:</p>
          <p style="word-break: break-all; color: #666;">
            ${verificationUrl}
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            این لینک تا ۲۴ ساعت اعتبار دارد. اگر این ایمیل را شما درخواست نکرده‌اید، آن را نادیده بگیرید.
          </p>
        </div>
      `,
      text: `
        خوش آمدید به آب‌های آزاد VTT
        
        سلام ${username} عزیز،
        
        برای تکمیل فرآیند ثبت نام، لطفاً ایمیل خود را تأیید کنید.
        
        لینک تأیید: ${verificationUrl}
        
        این لینک تا ۲۴ ساعت اعتبار دارد.
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  username: string,
  token: string
): Promise<boolean> => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"آب‌های آزاد VTT" <${process.env.SMTP_FROM || 'noreply@example.com'}>`,
      to: email,
      subject: 'بازیابی رمز عبور - آب‌های آزاد VTT',
      html: `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1976d2; text-align: center;">بازیابی رمز عبور</h2>
          
          <p>سلام ${username} عزیز،</p>
          
          <p>درخواست بازیابی رمز عبور برای حساب کاربری شما دریافت شده است.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              تغییر رمز عبور
            </a>
          </div>
          
          <p>یا می‌توانید لینک زیر را در مرورگر خود کپی کنید:</p>
          <p style="word-break: break-all; color: #666;">
            ${resetUrl}
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            این لینک تا ۱ ساعت اعتبار دارد. اگر این درخواست را شما نکرده‌اید، این ایمیل را نادیده بگیرید.
          </p>
        </div>
      `,
      text: `
        بازیابی رمز عبور - آب‌های آزاد VTT
        
        سلام ${username} عزیز،
        
        درخواست بازیابی رمز عبور برای حساب کاربری شما دریافت شده است.
        
        لینک بازیابی: ${resetUrl}
        
        این لینک تا ۱ ساعت اعتبار دارد.
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
};
