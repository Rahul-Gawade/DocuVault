import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, ArrowRight, Mail, RefreshCw } from 'lucide-react';
import { authApi } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { checkAuth } = useAuth();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const verify = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setMessage('No verification token provided in URL.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.verifyEmail(token);
      setSuccess(true);
      setMessage(res.message || 'Email verified successfully!');
      if (checkAuth) checkAuth();
    } catch (err) {
      setSuccess(false);
      setMessage(err.message || 'Verification link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  }, [token, checkAuth]);

  useEffect(() => {
    verify();
  }, [verify]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    try {
      await authApi.resendVerification(resendEmail);
      setResendSuccess(true);
    } catch (err) {
      alert(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900">
              DocuVault
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Email Verification</h1>
        </div>

        {/* Card */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-7 shadow-sm text-center">
          {loading ? (
            <div className="py-8 space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-neutral-900 mx-auto" />
              <h3 className="font-semibold text-neutral-900 text-base">Verifying your email...</h3>
              <p className="text-xs text-neutral-500">Checking cryptographic token authenticity</p>
            </div>
          ) : success ? (
            <div className="py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Account Verified!</h3>
              <p className="text-sm text-neutral-600 max-w-xs mx-auto leading-relaxed">
                {message}
              </p>
              <div className="pt-4">
                <Link
                  to="/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm rounded-xl shadow-sm transition"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 text-sky-400" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-5">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-1">Verification Failed</h3>
                <p className="text-xs text-neutral-600">{message}</p>
              </div>

              {/* Resend Verification Form */}
              <div className="pt-4 border-t border-neutral-100 text-left">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                  Request a new verification link
                </h4>
                {resendSuccess ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                    A fresh verification email has been sent. Please check your inbox!
                  </div>
                ) : (
                  <form onSubmit={handleResend} className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="your-email@example.com"
                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={resending}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition"
                    >
                      {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      Resend Verification Email
                    </button>
                  </form>
                )}
              </div>

              <div className="pt-2">
                <Link to="/login" className="text-xs text-neutral-500 hover:text-neutral-900 underline">
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
