import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  Copy,
  Check,
  Trash2,
  Download,
  Calendar,
  ShieldCheck,
  Loader2,
  ExternalLink,
  History,
  Users,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import StatusBadge from '../components/common/StatusBadge';
import DocumentViewer from '../components/signing/DocumentViewer';
import InviteModal from '../components/documents/InviteModal';
import AuditTimeline from '../components/audit/AuditTimeline';
import { documentsApi } from '../utils/api';

export default function DocumentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentsApi.get(id);
      setDocument(data.document);
      setRecipients(data.recipients || []);
      setAuditLogs(data.auditLogs || []);
    } catch (err) {
      setError(err.message || 'Failed to load document details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleCopyLink = (accessToken) => {
    const fullUrl = `${window.location.origin}/sign/${accessToken}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(accessToken);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRemoveRecipient = async (recipientId, recipientName) => {
    if (!window.confirm(`Are you sure you want to remove ${recipientName}?`)) return;
    try {
      await documentsApi.removeRecipient(id, recipientId);
      await fetchDetails();
    } catch (err) {
      alert(err.message || 'Failed to remove recipient');
    }
  };

  const handleDeleteDocument = async () => {
    if (!window.confirm(`Are you sure you want to delete this document and all its audit records?`)) return;
    try {
      await documentsApi.delete(id);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50/60">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
          <p className="text-sm">Loading document details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50/60">
        <Navbar />
        <div className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="p-8 bg-white border border-red-200 rounded-3xl shadow-sm">
            <h2 className="text-lg font-bold text-red-600 mb-2">Error Loading Document</h2>
            <p className="text-sm text-neutral-600 mb-6">{error || 'Document not found'}</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const latestSignedRecipient = recipients.find((r) => r.status === 'signed' && r.signatureImageUrl);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/60">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Navigation Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Documents
          </Link>

          <div className="flex items-center gap-2">
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>

            <button
              onClick={handleDeleteDocument}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Document
            </button>
          </div>
        </div>

        {/* Title and Metadata Header */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 mb-8 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                  {document.title}
                </h1>
                <StatusBadge status={document.status} size="md" />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Uploaded on{' '}
                  {new Date(document.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span>ID: {document._id}</span>
                <span>•</span>
                <span>
                  {recipients.filter((r) => r.status === 'signed').length} of {recipients.length} signers signed
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition active:scale-[0.98] shrink-0"
            >
              <UserPlus className="w-4 h-4 text-sky-400" />
              Invite Signer
            </button>
          </div>
        </div>

        {/* Main 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Document Viewer (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <DocumentViewer
              document={document}
              signedSignatureUrl={latestSignedRecipient?.signatureImageUrl}
            />
          </div>

          {/* Right Column: Signers & Audit Trail (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Signers Card */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-neutral-500" />
                  <h3 className="font-bold text-neutral-900 text-base">
                    Signers ({recipients.length})
                  </h3>
                </div>
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition"
                >
                  + Add Signer
                </button>
              </div>

              {recipients.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-sm">
                  <Users className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                  <p>No signers invited yet.</p>
                  <button
                    onClick={() => setIsInviteOpen(true)}
                    className="mt-2 text-xs font-semibold text-neutral-900 underline"
                  >
                    Invite your first recipient
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recipients.map((recipient) => {
                    const isCopied = copiedToken === recipient.accessToken;
                    const signUrl = `${window.location.origin}/sign/${recipient.accessToken}`;

                    return (
                      <div
                        key={recipient._id}
                        className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/60 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-neutral-900 text-sm">
                              {recipient.name}
                            </div>
                            <div className="text-xs text-neutral-500 font-mono">
                              {recipient.email}
                            </div>
                          </div>
                          <StatusBadge status={recipient.status} />
                        </div>

                        {/* If signed, show signature preview & timestamp */}
                        {recipient.status === 'signed' && (
                          <div className="p-3 bg-white rounded-lg border border-emerald-200 flex items-center justify-between gap-3">
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                Verified Signature
                              </div>
                              <div className="text-[11px] text-neutral-400 font-mono">
                                Signed {new Date(recipient.signedAt).toLocaleString()}
                              </div>
                            </div>
                            {recipient.signatureImageUrl && (
                              <img
                                src={recipient.signatureImageUrl}
                                alt="Signature preview"
                                className="h-9 max-w-[120px] object-contain"
                              />
                            )}
                          </div>
                        )}

                        {/* Signer Unique Link Actions */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-200/50 text-xs">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(recipient.accessToken)}
                            className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-neutral-900 font-medium py-1 px-2 rounded-md hover:bg-neutral-100 transition"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-semibold">Link Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-2">
                            <a
                              href={signUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 transition"
                              title="Open signing page in new tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Open
                            </a>

                            <button
                              type="button"
                              onClick={() => handleRemoveRecipient(recipient._id, recipient.name)}
                              className="text-neutral-400 hover:text-red-600 transition p-1"
                              title="Remove Signer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Audit Trail Timeline Card */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-neutral-500" />
                  <h3 className="font-bold text-neutral-900 text-base">
                    Audit Trail Ledger
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">
                  {auditLogs.length} events
                </span>
              </div>

              <AuditTimeline auditLogs={auditLogs} />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        documentId={id}
        onInviteSuccess={fetchDetails}
      />
    </div>
  );
}
