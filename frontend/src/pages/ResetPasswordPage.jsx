import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowRight, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const tokenParam = params.get('token');
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setResetToken(tokenParam);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !newPassword) {
      setError('Please provide email and new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword({ email, resetToken, newPassword });
      showToast('Password reset successful! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-warmth-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter your email, recovery code, and choose a new secure password.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. donor@foodbridge.org"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reset Code / Token</label>
              <input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Reset token from previous step"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Password (min 6 chars) *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 transition flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
