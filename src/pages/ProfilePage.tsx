import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { api } from '../services/api.js';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  Sparkles,
  Save,
  CheckCircle2,
  Package,
  MessageSquare,
  Activity,
  Clock,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { DEMO_USER } from '../data/demoData.js';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
];

const RECENT_ACTIVITIES = [
  {
    id: 'act-1',
    action: 'Generated AI Review Intelligence & Aspect Breakdown',
    target: 'Apple MacBook Pro 16" M3 Max',
    timestamp: '25 minutes ago',
    type: 'analysis',
    icon: Sparkles,
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60',
  },
  {
    id: 'act-2',
    action: 'Flagged 4 Suspicious / Bot-Generated Reviews',
    target: 'Breville Barista Touch Espresso Machine',
    timestamp: '2 hours ago',
    type: 'security',
    icon: Shield,
    color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60',
  },
  {
    id: 'act-3',
    action: 'Synthesized Multi-Marketplace Comparative Matrix',
    target: 'Samsung Galaxy S24 Ultra vs Sony WH-1000XM5',
    timestamp: '5 hours ago',
    type: 'compare',
    icon: TrendingUp,
    color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60',
  },
  {
    id: 'act-4',
    action: 'Completed Full Batch Sentiment Extraction (50 reviews)',
    target: 'Garmin Fenix 7X Sapphire Solar',
    timestamp: 'Yesterday at 4:15 PM',
    type: 'batch',
    icon: Activity,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
  },
  {
    id: 'act-5',
    action: 'Imported Verified Customer Review Dataset (Amazon & Flipkart)',
    target: 'Sony WH-1000XM5 Wireless Headphones',
    timestamp: '2 days ago',
    type: 'import',
    icon: FileText,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
  },
];

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const activeUser = user || DEMO_USER;
  const [name, setName] = useState(activeUser.name || 'Krishna Sharma');
  const [avatar, setAvatar] = useState(activeUser.avatar || AVATAR_OPTIONS[0]);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password update form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Name cannot be empty.');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await api.auth.updateProfile({ name: name.trim(), avatar });
      updateUser(res.data.user);
      success('Profile details updated successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      error('Please complete all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      error('New passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.auth.updatePassword(currentPassword, newPassword);
      success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      error(err.message || 'Failed to change password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header Summary */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative">
          <img
            src={avatar}
            alt={activeUser.name}
            className="w-24 h-24 rounded-3xl object-cover border-2 border-indigo-500 shadow-md"
          />
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-indigo-600 text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{activeUser.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {activeUser.role || 'Senior Analyst'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>{activeUser.email}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Joined {activeUser.createdAt ? new Date(activeUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'August 2026'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Verified Enterprise Account
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analyst Activity Metrics - Requirement 16 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
            <Package className="w-4 h-4" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60">
              Catalog
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">5</div>
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Products Analyzed
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400 mb-2">
            <MessageSquare className="w-4 h-4" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60">
              Evaluated
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">250</div>
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Reviews Analyzed
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60">
              Positive
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">72%</div>
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Sentiment Ratio
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60">
              Audit
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">95.2%</div>
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Authenticity Rate
          </div>
        </div>
      </div>

      {/* Recent Activity History - Requirement 16 */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Recent Intelligence Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audited timeline of product summaries, aspect extractions, and fraud screenings
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            5 Events
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {RECENT_ACTIVITIES.map(act => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="py-3.5 first:pt-2 last:pb-1 flex items-start gap-3.5">
                <div className={`p-2 rounded-xl shrink-0 ${act.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {act.action}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    Product: <span className="font-semibold text-slate-700 dark:text-slate-300">{act.target}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Profile Information */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Account Profile Settings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update your analyst persona, display name, and avatar image.
          </p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          {/* Avatar picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Choose Avatar
            </label>
            <div className="flex items-center gap-3">
              {AVATAR_OPTIONS.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(img)}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
                    avatar === img
                      ? 'border-cyan-500 ring-2 ring-cyan-500/30 scale-105'
                      : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Avatar option" className="w-12 h-12 object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={activeUser?.email || 'skpkrishna25@gmail.com'}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 shadow-sm transition-all flex items-center gap-2"
          >
            {isUpdatingProfile ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Profile</span>
          </button>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Security & Authentication
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep your credentials secure with encrypted password hashing.
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 6 chars"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 shadow-sm transition-all flex items-center gap-2"
          >
            {isUpdatingPassword ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            <span>Update Password</span>
          </button>
        </form>
      </div>
    </div>
  );
};
