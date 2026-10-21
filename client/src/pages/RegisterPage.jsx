import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock, ArrowRight, AlertCircle, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [devVerifyUrl, setDevVerifyUrl] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill out all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await register(name, email, password);
      setRegisteredSuccess(true);
      if (res?.devVerifyUrl) {
        setDevVerifyUrl(res.devVerifyUrl);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Heading */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900">
              DocuVault
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Create your owner account</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Upload documents, invite recipients, and collect e-signatures.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-7 shadow-sm">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {registeredSuccess ? (
            <div className="py-2 space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-semibold mb-1">Verify Your Email Address</h4>
                  <p className="text-emerald-700 text-xs leading-relaxed">
                    We've sent a verification link to <strong>{email}</strong>. Please click the link in your email to verify your account.
                  </p>
                </div>
              </div>

              {/* Dev mode helper */}
              {devVerifyUrl && (
                <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200 text-xs space-y-2">
                  <div className="font-semibold text-neutral-800">Local Testing Shortcut:</div>
                  <a
                    href={devVerifyUrl}
                    className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-800 font-medium break-all underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    Click here to instantly verify email
                  </a>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs rounded-xl shadow-sm transition"
                >
                  Continue to Dashboard
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Gawade"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@docuvault.io"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl shadow-sm transition active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Register Free
                    <ArrowRight className="w-4 h-4 text-sky-400" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-neutral-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-neutral-900 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
