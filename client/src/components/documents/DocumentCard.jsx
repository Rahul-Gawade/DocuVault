import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function DocumentCard({ doc, onDelete }) {
  const formattedDate = new Date(doc.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const fileSizeFormatted = doc.fileSize
    ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`
    : 'Document';

  const recipientCount = doc.recipientCount || (doc.recipients ? doc.recipients.length : 0);
  const signedCount = doc.signedCount || (doc.recipients ? doc.recipients.filter((r) => r.status === 'signed').length : 0);

  return (
    <div className="group relative bg-white border border-neutral-200/90 rounded-2xl p-5 hover:border-neutral-400/80 hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Top bar with file icon & status badge */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <StatusBadge status={doc.status} />
        </div>

        {/* Title */}
        <Link to={`/documents/${doc._id}`} className="block focus:outline-none">
          <h3 className="font-semibold text-neutral-900 text-base line-clamp-1 group-hover:text-sky-600 transition-colors">
            {doc.title}
          </h3>
        </Link>

        {/* Metadata info */}
        <div className="flex items-center gap-4 text-xs text-neutral-400 mt-2 mb-4 font-mono">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span>•</span>
          <span>{fileSizeFormatted}</span>
        </div>
      </div>

      {/* Recipient status & Actions footer */}
      <div className="pt-3.5 border-t border-neutral-100 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-neutral-600">
          <Users className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-medium">
            {recipientCount === 0 ? (
              <span className="text-neutral-400 italic">No recipients yet</span>
            ) : (
              <span>
                {signedCount} of {recipientCount} signed
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete "${doc.title}"?`)) {
                  onDelete(doc._id);
                }
              }}
              title="Delete Document"
              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <Link
            to={`/documents/${doc._id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:text-sky-600 transition-colors px-2 py-1 rounded-md hover:bg-neutral-50"
          >
            Manage
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
