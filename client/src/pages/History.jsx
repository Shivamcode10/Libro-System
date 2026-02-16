import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- ADDED IMPORT
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { Download, RefreshCw, AlertCircle, BookOpen, FileText } from 'lucide-react'; // <--- ADDED ICONS

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate(); // <--- INIT HOOK

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    setHistory([]);
    
    try {
      // CACHE BUSTER: Adds random number to URL to force browser to ignore cache
      const { data } = await api.get(`/issues/history?t=${Date.now()}`);
      setHistory(data);
    } catch (error) {
      console.error("Fetch Error", error);
      setError("Failed to load history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileUrl) => {
    if(!fileUrl) return alert("No file available");
    let url = fileUrl;
    if (!url.startsWith('http')) {
        url = `http://localhost:5000/uploads/${url}`;
    }
    window.open(url, '_blank');
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-indigo-600" /> My Library ({history.length})
            </h1>
            <p className="text-sm text-gray-500 mt-1">
                View your issued books, access saved notes, and download resources.
            </p>
        </div>

        <button 
            onClick={fetchHistory}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-indigo-600 border border-indigo-200 dark:border-gray-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 transition shadow-sm font-medium"
        >
            <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-3 border border-red-200 dark:border-red-900">
            <AlertCircle className="w-5 h-5 shrink-0" /> 
            <span>{error}</span>
        </div>
      )}

      {/* TABLE CARD */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm">

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-sm uppercase tracking-wide text-gray-600 dark:text-gray-300 font-semibold">
              <tr>
                <th className="px-6 py-4">Book Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">My Notes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                        <FileText className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-lg font-medium">No books issued yet.</p>
                        <p className="text-sm mt-1">Go to the catalog to issue your first book!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition group">
                    {/* BOOK TITLE */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white text-base">
                        {record.book ? record.book.title : <span className="text-red-500 font-normal">Book Deleted</span>}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {record.book?.author || 'Unknown Author'}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        record.status === 'Issued' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : record.status === 'Returned' 
                          ? 'bg-gray-100 text-gray-600 border-gray-200' 
                          : 'bg-red-100 text-red-800 border-red-200' // For Overdue
                      }`}>
                        {record.status}
                      </span>
                    </td>

                    {/* NOTES STATUS */}
                    <td className="px-6 py-4">
                        {record.notes && record.notes.length > 0 ? (
                            <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                <FileText className="w-3 h-3" />
                                <span className="text-xs font-semibold">Notes Saved</span>
                            </div>
                        ) : (
                            <span className="text-gray-400 dark:text-gray-600 text-xs italic">No notes</span>
                        )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            {/* READ & NOTES BUTTON */}
                            {record.book && (
                                <button 
                                    onClick={() => navigate(`/reader/${record.book._id}`)}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-md hover:shadow-lg transform active:scale-95"
                                    title="Read PDF & Edit Notes"
                                >
                                    <BookOpen className="w-3.5 h-3.5" /> Read
                                </button>
                            )}
                            
                            {/* DOWNLOAD BUTTON */}
                            <button 
                                onClick={() => handleDownload(record.book?.fileUrl)}
                                className={`inline-flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition border ${
                                    record.book?.fileUrl 
                                    ? 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' 
                                    : 'border-transparent text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!record.book?.fileUrl}
                                title="Download PDF"
                            >
                                <Download className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;