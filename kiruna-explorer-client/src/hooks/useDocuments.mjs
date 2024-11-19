import { useState } from 'react';
import API from '../API/API.mjs';

export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllDocuments = async () => {
    setLoading(true);
    try {
      const data = await API.getAllDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentById = async (id) => {
    setLoading(true);
    try {
      const data = await API.getDocumentById(id);
      setDocuments([data]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredDocuments = async (filters) => {
    setLoading(true);
    try {
      const data = await API.getFilteredDocuments(filters);
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    documents,
    loading,
    error,
    fetchAllDocuments,
    fetchDocumentById,
    fetchFilteredDocuments,
  };
};
