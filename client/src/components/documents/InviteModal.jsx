import React, { useState } from 'react';
import { UserPlus, Copy, Check, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import { documentsApi } from '../../utils/api';

export default function InviteModal({ isOpen, onClose, documentId, onInviteSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Please fill out both name and email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const recipient = await documentsApi.inviteRecipient(documentId, { name, email });
      const fullUrl = `${window.location.origin}/sign/${recipient.accessToken}`;
      setGeneratedLink(fullUrl);
      if (onInviteSuccess) onInviteSuccess(recipient);
    } catch (err) {
      setError(err.message || 'Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setError(null);
    setGeneratedLink(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="Invite Signer">
      {generatedLink ? (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm">
            <h4 className="font-semibold mb-1 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              Signer Invited Successfully!
            </h4>
            <p className="text-emerald-700 text-xs">
              A secure, unguessable access link has been generated. Share this link directly with {name}.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Unique Signing Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-mono text-neutral-800 select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <a
              href={generatedLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-800 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open signing portal in new tab
            </a>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-neutral-900 text-white text-xs font-medium rounded-lg hover:bg-neutral-800"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Signer's Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Signer's Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Used to record recipient identity in the audit trail.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  Generating Token...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-sky-400" />
                  Generate Link
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
