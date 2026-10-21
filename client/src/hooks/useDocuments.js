import { useState, useEffect, useCallback } from 'react';
import { documentsApi } from '../utils/api';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, partially_signed: 0, completed: 0 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentsApi.list({
        status: statusFilter,
        search: searchQuery,
        page,
        limit: 12,
      });
      setDocuments(data.docs || []);
      setStats(data.stats || { total: 0, pending: 0, partially_signed: 0, completed: 0 });
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, page]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const deleteDocument = async (id) => {
    await documentsApi.delete(id);
    await fetchDocuments();
  };

  return {
    documents,
    stats,
    total,
    totalPages,
    statusFilter,
    setStatusFilter: (s) => {
      setStatusFilter(s);
      setPage(1);
    },
    searchQuery,
    setSearchQuery: (q) => {
      setSearchQuery(q);
      setPage(1);
    },
    page,
    setPage,
    loading,
    error,
    refresh: fetchDocuments,
    deleteDocument,
  };
}
