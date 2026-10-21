import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import Modal from '../common/Modal';
import { documentsApi } from '../../utils/api';
import { useUploadProgress } from '../../hooks/useUploadProgress';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const { progress, status, isUploading, startUpload, completeUpload, failUpload, reset } = useUploadProgress();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);
    if (!selectedFile) return;

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only PDF, PNG, or JPG files are supported.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be 10MB or less.');
      return;
    }

    setFile(selectedFile);
    if (!title) {
      // Strip extension for cleaner title default
      const cleanTitle = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(cleanTitle);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a file to upload.');
      return;
    }

    setError(null);
    startUpload();

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim() || file.name);

      const createdDoc = await documentsApi.upload(formData);
      completeUpload();

      setTimeout(() => {
        handleClose();
        if (onUploadSuccess) onUploadSuccess(createdDoc);
      }, 700);
    } catch (err) {
      failUpload();
      setError(err.message || 'Upload failed. Please try again.');
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setFile(null);
    setTitle('');
    setError(null);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload New Document">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-neutral-900 bg-neutral-50 scale-[1.01]'
              : file
              ? 'border-emerald-300 bg-emerald-50/40'
              : 'border-neutral-200 hover:border-neutral-400 bg-neutral-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => validateAndSetFile(e.target.files[0])}
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-neutral-800 break-all">{file.name}</div>
              <div className="text-xs text-neutral-500 font-mono">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Document'}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="mt-1 text-xs text-red-600 hover:underline"
              >
                Change file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center">
                <Upload className="w-6 h-6 text-neutral-700" />
              </div>
              <div className="text-sm font-medium text-neutral-800">
                <span className="text-sky-600 font-semibold hover:underline">Click to browse</span> or drag and drop
              </div>
              <p className="text-xs text-neutral-400">PDF, PNG, JPG (up to 10MB)</p>
            </div>
          )}
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
            Document Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Consulting Agreement 2026"
            className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
          />
        </div>

        {/* Upload Progress Indicator */}
        {isUploading && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-neutral-600 font-medium">
              <span>{status === 'processing' ? 'Processing & encrypting...' : 'Uploading file...'}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-900 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Document uploaded successfully! Redirecting...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!file || isUploading || status === 'completed'}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                Uploading...
              </>
            ) : (
              'Upload Document'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
