import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, FileText, LogOut, User, Menu, X, PlusCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar({ onOpenUpload }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isCurrent = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center text-white shadow-sm group-hover:bg-neutral-800 transition-colors">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-neutral-900 flex items-center gap-1.5">
              DocuVault
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">
                v1.0
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  isCurrent('/dashboard') ? 'text-neutral-900 font-semibold' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Dashboard
              </Link>

              {onOpenUpload && (
                <button
                  onClick={onOpenUpload}
                  className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow active:scale-[0.98]"
                >
                  <PlusCircle className="w-4 h-4 text-sky-400" />
                  Upload Document
                </button>
              )}

              <div className="h-5 w-px bg-neutral-200" />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg text-sm text-neutral-700">
                  <User className="w-4 h-4 text-neutral-500" />
                  <span className="font-medium">{user?.name || user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-neutral-500 hover:text-red-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isCurrent('/') ? 'text-neutral-900 font-semibold' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Product
              </Link>
              <a
                href="#features"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#security"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Security & Audit
              </a>

              <div className="h-5 w-px bg-neutral-200" />

              <Link
                to="/login"
                className="text-sm font-medium text-neutral-700 hover:text-neutral-900 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow active:scale-[0.98]"
              >
                Get Started Free
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          {isAuthenticated && onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="p-2 bg-neutral-900 text-white rounded-lg shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-sky-400" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 bg-white px-4 pt-3 pb-5 space-y-3">
          {isAuthenticated ? (
            <>
              <div className="py-2 border-b border-neutral-100 text-sm font-medium text-neutral-800">
                Signed in as <span className="font-semibold">{user?.name}</span>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-neutral-700 py-1"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 w-full text-left text-sm font-medium text-red-600 py-1"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-neutral-700 py-1"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full bg-neutral-900 text-white text-sm font-medium py-2.5 rounded-lg"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
