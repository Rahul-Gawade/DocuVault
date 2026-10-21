import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  FileSignature,
  Plus,
  Search,
  Filter,
  Loader2,
  UploadCloud,
  FileCheck2,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import DocumentCard from '../components/documents/DocumentCard';
import UploadModal from '../components/documents/UploadModal';
import { useDocuments } from '../hooks/useDocuments';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../utils/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  const {
    documents,
    stats,
    total,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    refresh,
    deleteDocument,
  } = useDocuments();

  const handleUploadSuccess = (newDoc) => {
    refresh();
    if (newDoc?._id) {
      navigate(`/documents/${newDoc._id}`);
    }
  };

  const statCards = [
    {
      label: 'Total Documents',
      value: stats.total,
      icon: FileText,
      color: 'text-neutral-900',
      bg: 'bg-neutral-100',
      filterKey: 'all',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      filterKey: 'pending',
    },
    {
      label: 'Partially Signed',
      value: stats.partially_signed,
      icon: FileSignature,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      filterKey: 'partially_signed',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      filterKey: 'completed',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/60">
      <Navbar onOpenUpload={() => setIsUploadModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Email verification alert banner */}
        {user && !user.isEmailVerified && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold">Your email address is not verified yet.</span>
                <p className="text-amber-700 mt-0.5">
                  Please verify {user.email} to receive automatic signer notifications and audit updates.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {emailSentNotice ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">
                  ✓ Fresh link sent!
                </span>
              ) : (
                <button
                  type="button"
                  disabled={resendingEmail}
                  onClick={async () => {
                    setResendingEmail(true);
                    try {
                      await authApi.resendVerification(user.email);
                      setEmailSentNotice(true);
                    } catch (err) {
                      alert(err.message || 'Failed to resend verification email');
                    } finally {
                      setResendingEmail(false);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white rounded-lg text-xs font-medium transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {resendingEmail ? 'Sending...' : 'Resend Verification Link'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Header Greeting & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Welcome back, {user?.name || 'Owner'}
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Track status, invite signers, and view immutable audit trails.
            </p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition active:scale-[0.98] shrink-0"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            Upload Document
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            const isSelected = statusFilter === card.filterKey;
            return (
              <button
                key={card.label}
                type="button"
                onClick={() => setStatusFilter(card.filterKey)}
                className={`p-5 rounded-2xl bg-white border text-left transition-all ${
                  isSelected
                    ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-sm'
                    : 'border-neutral-200/90 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    {card.label}
                  </span>
                  <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                  {card.value}
                </div>
              </button>
            );
          })}
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { label: 'All Documents', key: 'all' },
              { label: 'Pending', key: 'pending' },
              { label: 'Partially Signed', key: 'partially_signed' },
              { label: 'Completed', key: 'completed' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === tab.key
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by title..."
              className="w-full pl-9 pr-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Document Grid / Loading / Empty State */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
            <span className="text-sm font-medium">Loading documents...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-600 text-sm bg-red-50 rounded-2xl border border-red-200 p-6">
            {error}
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white border border-neutral-200 border-dashed rounded-3xl p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">No documents found</h3>
            <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'Upload your first contract or agreement to invite signers and collect electronic signatures.'}
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm rounded-xl shadow-sm transition active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-sky-400" />
              Upload Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map((doc) => (
              <DocumentCard
                key={doc._id}
                doc={doc}
                onDelete={deleteDocument}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
