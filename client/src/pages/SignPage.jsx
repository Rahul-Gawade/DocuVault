import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  Loader2,
  Download,
  Calendar,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import DocumentViewer from '../components/signing/DocumentViewer';
import SignaturePad from '../components/signing/SignaturePad';
import StatusBadge from '../components/common/StatusBadge';
import { accessApi } from '../utils/api';

export default function SignPage() {
  const { token } = useParams();

  const [document, setDocument] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeSignature, setActiveSignature] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    async function fetchAccess() {
      try {
        setLoading(true);
        setError(null);
        const data = await accessApi.get(token);
        setDocument(data.document);
        setRecipient(data.recipient);
        if (data.recipient.status === 'signed') {
          setActiveSignature(data.recipient.signatureImageUrl);
          setSubmitSuccess(true);
        }
      } catch (err) {
        setError(err.message || 'Invalid or expired signing link');
      } finally {
        setLoading(false);
      }
    }

    if (token) fetchAccess();
  }, [token]);

  const handleSubmitSignature = async () => {
    if (!activeSignature) {
      alert('Please adopt or draw your signature first.');
      return;
    }
    if (!agreedToTerms) {
      alert('Please agree to the electronic signature disclosure.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await accessApi.sign(token, activeSignature);
      setRecipient(res.recipient);
      setSubmitSuccess(true);
    } catch (err) {
      alert(err.message || 'Failed to submit signature');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-900 mb-3" />
        <h2 className="text-base font-semibold text-neutral-800">Verifying secure access link...</h2>
        <p className="text-xs text-neutral-500 font-mono mt-1">Authenticating cryptographic token</p>
      </div>
    );
  }

  if (error || !document || !recipient) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-3xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Access Link Invalid or Expired</h2>
          <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
            {error || 'This signing link is no longer valid. Please contact the document sender to request a new invitation.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800"
          >
            Go to DocuVault Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/70">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <span className="font-bold text-base tracking-tight text-neutral-900">
              DocuVault <span className="font-normal text-xs text-neutral-500">Signing Portal</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-lg">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure 256-bit Session</span>
          </div>
        </div>
      </header>

      {/* Main Signing Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Recipient Greeting Banner */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 mb-8 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 text-xs font-semibold mb-2">
                Signer Verification
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Hello, {recipient.name}
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                {document.owner?.name ? (
                  <span>
                    <strong className="text-neutral-900">{document.owner.name}</strong> has invited you to review and sign:{' '}
                    <span className="italic font-medium">{document.title}</span>
                  </span>
                ) : (
                  <span>Please review and sign <span className="italic font-medium">{document.title}</span> below.</span>
                )}
              </p>
            </div>

            <StatusBadge status={recipient.status} size="md" />
          </div>
        </div>

        {/* If Already Signed / Completion Card */}
        {submitSuccess ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-emerald-300 rounded-3xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Document Successfully Signed!
              </h2>
              <p className="text-sm text-neutral-600 max-w-md mx-auto mb-6">
                Your digital signature and audit event timestamp have been cryptographically recorded into the document's permanent ledger.
              </p>

              {/* Verified Certificate Box */}
              <div className="max-w-md mx-auto p-5 bg-neutral-50 rounded-2xl border border-neutral-200 text-left space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-neutral-200/80 pb-2">
                  <span className="text-neutral-500 uppercase">Document:</span>
                  <span className="font-semibold text-neutral-900">{document.title}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200/80 pb-2">
                  <span className="text-neutral-500 uppercase">Signer Name:</span>
                  <span className="font-semibold text-neutral-900">{recipient.name}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200/80 pb-2">
                  <span className="text-neutral-500 uppercase">Signer Email:</span>
                  <span className="font-semibold text-neutral-900">{recipient.email}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200/80 pb-2">
                  <span className="text-neutral-500 uppercase">Signed At:</span>
                  <span className="font-semibold text-neutral-900">
                    {recipient.signedAt ? new Date(recipient.signedAt).toLocaleString() : new Date().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-neutral-500 uppercase">Signature:</span>
                  {activeSignature && (
                    <img
                      src={activeSignature}
                      alt="Verified Signature"
                      className="h-10 object-contain bg-white px-2 py-1 rounded border border-neutral-200"
                    />
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 shadow-sm"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  Download Document
                </a>
                <Link
                  to="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-white border border-neutral-300 text-neutral-800 text-xs font-semibold rounded-xl hover:bg-neutral-50"
                >
                  Return to Home
                </Link>
              </div>
            </div>

            {/* Document Viewer */}
            <DocumentViewer
              document={document}
              signedSignatureUrl={activeSignature}
            />
          </div>
        ) : (
          /* Active Signing Flow */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Document Viewer (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-500 px-1">
                <span>Step 1: Review Document Content</span>
                <span>Scroll to inspect</span>
              </div>
              <DocumentViewer
                document={document}
                signedSignatureUrl={activeSignature}
              />
            </div>

            {/* Right: Signature Capture & Submit (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-500 px-1">
                <span>Step 2: Sign Document</span>
                <span>Canvas Capture</span>
              </div>

              {/* Signature Pad */}
              <SignaturePad
                defaultName={recipient.name}
                onSignatureCapture={(sigData) => {
                  setActiveSignature(sigData);
                }}
              />

              {/* Active Signature Display */}
              {activeSignature && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Signature Ready
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Applied to document preview
                    </div>
                  </div>
                  <img
                    src={activeSignature}
                    alt="Active preview"
                    className="h-10 object-contain bg-white px-2 py-1 rounded-lg border border-emerald-200"
                  />
                </div>
              )}

              {/* Legal Agreement Checkbox */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span className="text-xs text-neutral-600 leading-relaxed">
                    I, <strong className="text-neutral-900">{recipient.name}</strong>, agree that this electronic signature is the legally binding equivalent of my handwritten signature under the ESIGN Act and UETA guidelines.
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handleSubmitSignature}
                  disabled={!activeSignature || !agreedToTerms || submitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm rounded-xl shadow-md transition active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                      Cryptographically Recording Signature...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Sign & Complete Document
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 border-t border-neutral-200 bg-white text-center text-xs text-neutral-400">
        DocuVault Secure E-Signature Environment • 256-bit Token Authorization
      </footer>
    </div>
  );
}
