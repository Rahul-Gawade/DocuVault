import React from 'react';
import { ShieldCheck, Lock, FileSignature, CheckCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-neutral-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
              </div>
              <span className="font-bold text-neutral-900 text-base">DocuVault</span>
            </div>
            <p className="text-sm text-neutral-500 max-w-sm">
              Lightweight, secure document sharing and e-signature simulator for modern freelancers, teams, and developers.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md">
                <Lock className="w-3 h-3 text-sky-600" />
                Token-Based Access
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md">
                <FileSignature className="w-3 h-3 text-emerald-600" />
                Canvas Signatures
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 mb-3">
              Core Architecture
            </h4>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li>MERN Fullstack Architecture</li>
              <li>Cryptographic Sharing Tokens</li>
              <li>Immutable Audit Trail Log</li>
              <li>Realtime Status Computation</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 mb-3">
              Compliance & Standards
            </h4>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> ESIGN Act Simulated
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> UETA Standards Ready
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> IP & Timestamp Tracking
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>© {new Date().getFullYear()} DocuVault. All rights reserved.</p>
          <p className="font-mono text-neutral-400">Target Duration: 14-Day Full-Stack Milestone Project</p>
        </div>
      </div>
    </footer>
  );
}
