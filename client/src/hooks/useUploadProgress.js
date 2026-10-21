import { useState, useCallback, useRef } from 'react';

export function useUploadProgress() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
  const intervalRef = useRef(null);

  const startUpload = useCallback(() => {
    setProgress(10);
    setStatus('uploading');

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(intervalRef.current);
          setStatus('processing');
          return 88;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);
  }, []);

  const completeUpload = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(100);
    setStatus('completed');
  }, []);

  const failUpload = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);
    setStatus('error');
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);
    setStatus('idle');
  }, []);

  return {
    progress,
    status,
    isUploading: status === 'uploading' || status === 'processing',
    startUpload,
    completeUpload,
    failUpload,
    reset,
  };
}
