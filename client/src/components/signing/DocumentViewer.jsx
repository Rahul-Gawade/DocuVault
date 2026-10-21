import React, { useState } from 'react';
import { FileText, Download, ExternalLink, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

export default function DocumentViewer({ document, signedSignatureUrl }) {
  const [zoom, setZoom] = useState(100);

  if (!document) return null;

  const isPdf = document.fileType === 'application/pdf' || document.fileUrl?.endsWith('.pdf');
  const isImage = document.fileType?.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(document.fileUrl || '');

  return (
    <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Viewer Toolbar */}
      <div className="px-4 py-3 bg-neutral-50/80 border-b border-neutral-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-sky-400" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-neutral-900 truncate">
              {document.title}
            </h4>
            <p className="text-[11px] text-neutral-400 font-mono">
              {isPdf ? 'PDF Document' : 'Document Image'} • {document.fileSize ? `${(document.fileSize / (1024 * 1024)).toFixed(1)} MB` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={document.fileUrl}
            target="_blank"
            rel="noreferrer"
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </a>
          <a
            href={document.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
            title="Open in new window"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Document Content Area */}
      <div className="relative bg-neutral-100 min-h-[480px] max-h-[680px] overflow-auto flex items-center justify-center p-4">
        {isPdf ? (
          <div className="w-full h-full min-h-[500px] flex flex-col items-center">
            <iframe
              src={`${document.fileUrl}#toolbar=0`}
              title={document.title}
              className="w-full h-[540px] rounded-xl border border-neutral-300 bg-white shadow-sm"
            />
          </div>
        ) : isImage ? (
          <div className="relative max-w-full">
            <img
              src={document.fileUrl}
              alt={document.title}
              className="max-h-[520px] max-w-full rounded-lg shadow-md object-contain bg-white"
            />

            {/* If signed signature exists, visually superimpose at bottom */}
            {signedSignatureUrl && (
              <div className="absolute bottom-6 right-6 p-2 bg-white/90 backdrop-blur-sm border border-emerald-300 rounded-lg shadow-lg flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider mb-1">
                  Verified Electronic Signature
                </span>
                <img
                  src={signedSignatureUrl}
                  alt="Verified Signature"
                  className="h-12 object-contain"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 bg-white rounded-xl border border-neutral-200 shadow-sm max-w-md">
            <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-800 mb-1">{document.title}</p>
            <p className="text-xs text-neutral-500 mb-4">
              Preview not directly renderable in this browser window.
            </p>
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white text-xs font-medium rounded-lg hover:bg-neutral-800"
            >
              <Download className="w-3.5 h-3.5" />
              Download & View Document
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
