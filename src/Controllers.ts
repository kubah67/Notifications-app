import bcrypt from 'bcryptjs';
import { JWTUtils } from '../utils/jwt.utils';
import { AppError } from '../utils/errorHandler';
import { EmailService } from '../services/email.service';

const emailService = new EmailService();

export class AuthController {
  static async signup(body: any, prisma: any) {
    const { email, password, role = 'ATTENDEE' } = body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    if (!email.includes('@')) {
      throw new AppError('Invalid email format', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    try {
      await emailService.sendWelcomeEmail(user.email, user.email.split('@')[0]);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    const token = JWTUtils.sign({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      success: true,
      message: 'User created successfully',
      data: {
        user,
        token
      }
    };
  }

  static async login(body: any, prisma: any) {
    const { email, password } = body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = JWTUtils.sign({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        },
        token
      }
    };
  }

  static async getProfile(user: any, prisma: any) {
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!userData) {
      throw new AppError('User not found', 404);
    }

    return {
      success: true,
      data: userData
    };
  }
}
