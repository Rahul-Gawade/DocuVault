import React from 'react';
import { Upload, Mail, Eye, CheckCircle2, Trash2, Clock, Globe } from 'lucide-react';

export default function AuditTimeline({ auditLogs = [] }) {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400 text-sm">
        No audit activity recorded yet.
      </div>
    );
  }

  const getActionConfig = (action) => {
    switch (action) {
      case 'created':
        return {
          icon: Upload,
          bg: 'bg-blue-100 text-blue-700',
          title: 'Document Uploaded',
        };
      case 'invited':
        return {
          icon: Mail,
          bg: 'bg-sky-100 text-sky-700',
          title: 'Signer Invited',
        };
      case 'viewed':
        return {
          icon: Eye,
          bg: 'bg-purple-100 text-purple-700',
          title: 'Document Viewed',
        };
      case 'signed':
        return {
          icon: CheckCircle2,
          bg: 'bg-emerald-100 text-emerald-700',
          title: 'Document Signed',
        };
      case 'removed':
        return {
          icon: Trash2,
          bg: 'bg-neutral-100 text-neutral-600',
          title: 'Recipient Removed',
        };
      default:
        return {
          icon: Clock,
          bg: 'bg-neutral-100 text-neutral-600',
          title: action,
        };
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {auditLogs.map((log, logIdx) => {
          const config = getActionConfig(log.action);
          const Icon = config.icon;
          const isLast = logIdx === auditLogs.length - 1;
          const date = new Date(log.timestamp);

          return (
            <li key={log._id || logIdx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-neutral-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  {/* Icon Node */}
                  <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${config.bg} ring-4 ring-white shadow-sm`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>

                  {/* Log Content */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <p className="text-sm font-semibold text-neutral-900">
                        {config.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                        <Clock className="w-3 h-3" />
                        <time dateTime={log.timestamp}>
                          {date.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          at{' '}
                          {date.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </time>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 mt-1">
                      {log.details || `Action recorded: ${log.action}`}
                    </p>

                    {log.ipAddress && (
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono mt-1">
                        <Globe className="w-3 h-3" />
                        <span>IP: {log.ipAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
