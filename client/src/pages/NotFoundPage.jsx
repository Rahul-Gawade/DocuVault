import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mb-4">
        <ShieldCheck className="w-6 h-6 text-sky-400" />
      </div>
      <h1 className="text-4xl font-extrabold text-neutral-900 mb-2">404</h1>
      <p className="text-base text-neutral-600 mb-6 max-w-sm">
        The page or document link you requested could not be located.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white font-medium text-xs rounded-xl hover:bg-neutral-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  );
}
