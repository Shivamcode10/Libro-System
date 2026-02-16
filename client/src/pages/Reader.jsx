import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import api from '../services/api';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const Reader = () => {
  const { id } = useParams(); // Book ID
  const navigate = useNavigate();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Fetch Book Data & Notes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // We still fetch book details for the title, even without PDF
        const [bookRes, notesRes] = await Promise.all([
          api.get(`/books/${id}`),
          api.get(`/issues/book/${id}/notes`) 
        ]);

        setBook(bookRes.data);
        setNotes(notesRes.data.notes || '');
        setLoading(false);
      } catch (err) {
        console.error("Reader Load Error:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await api.put(`/issues/book/${id}/notes`, { notes });
      alert('Notes saved successfully!');
    } catch (err) {
      alert('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (!book) return <div className="p-10 text-center">Book not found.</div>;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-gray-900 text-white">
      
      {/* HEADER */}
      <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link to={user?.role === 'admin' ? `/admin-dashboard` : `/history`} className="text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold truncate max-w-md">
            Notes: {book.title}
          </h1>
        </div>
        <button 
          onClick={handleSaveNotes} 
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Notes'}
        </button>
      </div>

      {/* MAIN CONTENT: FULL WIDTH NOTES AREA */}
      <div className="flex-1 flex justify-center p-4 md:p-8 overflow-hidden">
        <div className="w-full max-w-6xl bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 flex flex-col h-full">
          
          {/* Notes Sub-Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-800/50 rounded-t-2xl">
            <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">My Private Notes</h2>
                <span className="text-xs text-gray-500">Saved to your library folder</span>
            </div>
          </div>
          
          {/* Full Width Textarea */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Start typing your notes here..."
            className="flex-1 w-full bg-gray-800 text-gray-200 p-6 resize-none outline-none focus:bg-gray-750 leading-relaxed text-base font-mono"
            spellCheck="false"
          ></textarea>
        </div>
      </div>

    </div>
  );
};

export default Reader;