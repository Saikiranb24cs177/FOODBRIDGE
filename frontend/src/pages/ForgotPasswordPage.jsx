import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please provide your registered email address');
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.forgotPassword(email);
      setSubmitted(true);
      if (res.resetToken) {
        setGeneratedToken(res.resetToken);
      }
      showToast('Password reset link generated!', 'success');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to request reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-warmth-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Forgot Password
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter your registered FoodBridge email and we'll generate password recovery instructions.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-200/50">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Reset Code Ready</h3>
              <p className="text-xs text-slate-600">
                Instructions have been issued for <strong>{email}</strong>.
              </p>
              {generatedToken && (
                <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-left text-xs space-y-1">
                  <span className="font-bold text-brand-800">Direct Dev Reset Code:</span>
                  <div className="font-mono bg-white p-2 rounded border border-brand-300 text-brand-900 select-all break-all">
                    {generatedToken}
                  </div>
                </div>
              )}
              <Link
                to={`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(generatedToken)}`}
                className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Continue to Set New Password</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. donor@foodbridge.org"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    required
                  />
                </div>
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
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

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

export default ForgotPasswordPage;
