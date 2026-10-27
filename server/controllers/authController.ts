import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, UserDoc } from '../config/db.js';
import { generateToken, AuthRequest } from '../middleware/auth.js';
import { pgGetUserByEmail, pgGetUserById, pgUpsertUser } from '../services/supabaseService.js';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await pgGetUserByEmail(normalizedEmail);
    if (existing) {
      res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser: UserDoc = {
      _id: uuidv4(),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      settings: {
        theme: 'dark',
        emailNotifications: true,
        autoAnalyzeReviews: true,
        aiTemperature: 0.7,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedUser = await pgUpsertUser(newUser);
    const token = generateToken(savedUser);
    const { password: _, ...safeUser } = savedUser;

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: { user: safeUser, token },
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error during registration.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await pgGetUserByEmail(normalizedEmail);
    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Logged in successfully!',
      data: { user: safeUser, token },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error during login.' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }
    const { password: _, ...safeUser } = req.user;
    res.json({ success: true, data: { user: safeUser } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    // Prevent horizontal privilege escalation if userId is supplied in body
    if (req.body.userId && req.body.userId !== req.user._id && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Forbidden: You can only update your own profile.' });
      return;
    }

    const { name, email, profileImage, settings } = req.body;
    const user = (await pgGetUserById(req.user._id)) || db.users.get(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (name) user.name = name.trim();
    if (email && email.toLowerCase().trim() !== user.email) {
      const normalized = email.toLowerCase().trim();
      const existing = await pgGetUserByEmail(normalized);
      if (existing && existing._id !== user._id) {
        res.status(400).json({ success: false, message: 'This email is already in use.' });
        return;
      }
      user.email = normalized;
    }
    if (profileImage) user.profileImage = profileImage;
    if (settings) {
      user.settings = { ...user.settings, ...settings };
    }
    user.updatedAt = new Date().toISOString();

    const saved = await pgUpsertUser(user);
    const { password: _, ...safeUser } = saved;
    res.json({ success: true, message: 'Profile updated successfully!', data: { user: safeUser } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating profile.' });
  }
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Please provide current and new password.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      return;
    }

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      res.status(400).json({ success: false, message: 'New passwords do not match.' });
      return;
    }

    const user = (await pgGetUserById(req.user._id)) || db.users.get(req.user._id);
    if (!user || !user.password) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = new Date().toISOString();

    await pgUpsertUser(user);

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error changing password.' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.json({ success: true, message: 'Logged out successfully.' });
}
