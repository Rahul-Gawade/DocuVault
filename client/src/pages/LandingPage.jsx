import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileSignature,
  History,
  Lock,
  ArrowRight,
  CheckCircle2,
  Share2,
  Eye,
  FileCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SignaturePad from '../components/signing/SignaturePad';

export default function LandingPage() {
  const [demoSignature, setDemoSignature] = useState(null);
  const [demoSignedTime, setDemoSignedTime] = useState(null);

  const handleDemoSignature = (sigUrl) => {
    setDemoSignature(sigUrl);
    setDemoSignedTime(new Date());
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section with Sky Wash */}
      <section className="relative overflow-hidden gradient-sky pt-16 pb-24 md:pt-24 md:pb-32 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-neutral-200/80 shadow-xs mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-800">
              Modern Document Workflow & E-Sign Platform
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 max-w-4xl mx-auto leading-[1.08]">
            Sign contracts and agreements with{' '}
            <span className="bg-gradient-to-r from-neutral-900 via-sky-900 to-sky-600 bg-clip-text text-transparent">
              cryptographic certainty.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            DocuVault delivers lightning-fast document sharing, canvas-based electronic signatures, and immutable audit trails without the bloat of expensive enterprise tools.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-base rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              Start Free Today
              <ArrowRight className="w-4 h-4 text-sky-400" />
            </Link>
            <a
              href="#interactive-demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-neutral-50 text-neutral-900 font-medium text-base rounded-xl border border-neutral-300 shadow-xs transition"
            >
              <Sparkles className="w-4 h-4 text-sky-600" />
              Try Interactive Signature Demo
            </a>
          </div>

          {/* Trust stats pill bar */}
          <div className="mt-14 pt-8 border-t border-neutral-200/60 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-neutral-900">100%</div>
              <div className="text-xs text-neutral-500 font-medium mt-0.5">Audit Trail Logged</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">256-bit</div>
              <div className="text-xs text-neutral-500 font-medium mt-0.5">Secure Token Keys</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">0s</div>
              <div className="text-xs text-neutral-500 font-medium mt-0.5">Recipient Sign Up Required</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">ESIGN</div>
              <div className="text-xs text-neutral-500 font-medium mt-0.5">Compliant Workflow</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Pillars */}
      <section id="features" className="py-20 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-sky-700 mb-2">
              Engineered For Speed & Trust
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
              The 3-Pillar Document Architecture
            </h3>
            <p className="mt-3 text-neutral-600 text-sm sm:text-base">
              A carefully designed system solving real problems for freelancers, founders, and small teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-white rounded-2xl p-7 border border-neutral-200/90 shadow-sm hover:border-neutral-400 transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900 mb-2">
                1. Token-Based Secure Access
              </h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Recipients access their designated document via high-entropy cryptographic tokens. No forced account registration or tedious passwords — just immediate, authenticated access.
              </p>
              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs font-mono text-neutral-400">
                <Zap className="w-3.5 h-3.5 text-sky-500" />
                <span>crypto.randomBytes(32).hex</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-2xl p-7 border border-neutral-200/90 shadow-sm hover:border-neutral-400 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-5">
                <FileSignature className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900 mb-2">
                2. HTML5 Canvas E-Signatures
              </h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Smooth vector-like drawing with touch and mouse support on high-DPI displays. Or switch to cursive calligraphy fonts for instant typed signatures.
              </p>
              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs font-mono text-neutral-400">
                <Zap className="w-3.5 h-3.5 text-purple-500" />
                <span>HiDPI Retina Canvas API</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-2xl p-7 border border-neutral-200/90 shadow-sm hover:border-neutral-400 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5">
                <History className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900 mb-2">
                3. Immutable Audit Trail
              </h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Every view and signature event is automatically logged with exact timestamps, IP address data, and signer identity in a dedicated collection.
              </p>
              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs font-mono text-neutral-400">
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                <span>Non-repudiation event ledger</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Signature Sandbox Simulator */}
      <section id="interactive-demo" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-800 px-3 py-1 rounded-full">
              Live Sandbox
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mt-3">
              Test The Signature Engine Right Now
            </h3>
            <p className="text-sm text-neutral-600 mt-2">
              Draw or type your signature below to experience the real signing capture flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: Interactive Pad */}
            <div>
              <SignaturePad
                defaultName="Alex Morgan"
                onSignatureCapture={handleDemoSignature}
              />
            </div>

            {/* Right: Live Simulated Certificate & Audit Log */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <h4 className="font-semibold text-neutral-900 text-sm flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Simulated Document Output
                </h4>
                <span className="text-xs font-mono text-neutral-400">Sim-v1.0</span>
              </div>

              {demoSignature ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 bg-white border border-emerald-300 rounded-xl shadow-xs">
                    <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
                      <CheckCircle2 className="w-4 h-4" /> Signature Captured & Adopted
                    </div>
                    <div className="h-20 bg-neutral-50 rounded-lg flex items-center justify-center border border-dashed border-neutral-200 p-2">
                      <img
                        src={demoSignature}
                        alt="Captured signature"
                        className="max-h-full object-contain"
                      />
                    </div>
                    <div className="mt-3 text-xs text-neutral-500 font-mono flex justify-between">
                      <span>Signer: Alex Morgan</span>
                      <span>{demoSignedTime?.toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-900 text-white rounded-xl text-xs space-y-2 font-mono">
                    <div className="text-neutral-400 font-bold uppercase text-[10px]">
                      Simulated Audit Record Generated:
                    </div>
                    <div className="text-sky-300">
                      ACTION: "document_signed"
                    </div>
                    <div className="text-neutral-300">
                      SIGNER: alex@example.com
                    </div>
                    <div className="text-neutral-400">
                      IP: 192.168.1.1 (Simulated)
                    </div>
                    <div className="text-emerald-400">
                      STATUS: parent_document -&gt; "completed"
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-400 text-sm space-y-2">
                  <FileSignature className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
                  <p className="font-medium text-neutral-600">No signature applied yet</p>
                  <p className="text-xs max-w-xs mx-auto">
                    Sign on the canvas on the left and click "Apply Signature" to see the live output.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ready CTA Band */}
      <section className="py-16 bg-neutral-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to upgrade your document workflow?
          </h2>
          <p className="mt-4 text-neutral-400 text-base max-w-xl mx-auto">
            Create an owner account in 10 seconds, upload your first agreement, and invite signers with secure direct links.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-7 py-3.5 bg-white text-neutral-900 font-semibold rounded-xl hover:bg-neutral-100 transition shadow-sm"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="px-7 py-3.5 bg-neutral-800 text-white font-medium rounded-xl hover:bg-neutral-700 transition border border-neutral-700"
            >
              Sign In To Existing Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
