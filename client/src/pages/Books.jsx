import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import BookModal from '../components/BookModal';
import ReadBookModal from '../components/ReadBookModal';
import { Search, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import SkeletonBookCard from "../components/ui/SkeletonBookCard"; 
import VibeMatcher from '../components/VibeMatcher';

const Books = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [readingBook, setReadingBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  
  const { theme } = useTheme();
  const { user } = useAuth();
 
  const pageBg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const textMain = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSub = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const cardGlass = 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700';

  const PRESET_CATEGORIES = [
    'Engineering', 'Agriculture', 'Coding', 'Motivational', 
    'Science', 'History', 'Fiction', 'Business', 'Health', 
    'Art', 'Technology', 'Mathematics'
  ];

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/books');
      setBooks(data);
    } catch (error) {
      console.error("Failed to fetch books", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleVibeMatch = (bookId) => {
    navigate(`/books/${bookId}`);
  };

  const handleBookSubmit = async (formData) => {
    try {
      if (editingBook) {
        await api.put(`/books/${editingBook._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Book updated successfully!');
      } else {
        await api.post('/books', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Book added successfully!');
      }
      setIsModalOpen(false);
      setEditingBook(null);
      fetchBooks(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save book');
    }
  };

  const handleEditClick = (book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleIssue = async (bookId) => {
    if (!confirm("Issue this book?")) return;
    try {
      await api.post('/issues', { bookId });
      alert("Book Issued!");
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to issue book");
    }
  };

  const handleDelete = async (bookId) => {
    if (!confirm("Delete this book?")) return;
    try {
      await api.delete(`/books/${bookId}`);
      fetchBooks();
    } catch (error) {
      alert("Failed to delete book");
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'All' || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set([...PRESET_CATEGORIES, ...books.map(b => b.category)])];
  const closeModal = () => { setIsModalOpen(false); setEditingBook(null); };

  return (
    // ADDED: max-w-7xl mx-auto to prevent over-stretching on large screens
    <div className={`${pageBg} min-h-screen transition-colors duration-300`}>
      <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-[1600px] mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-6 animate-fade-in">
          <div>
            {/* ADDED: Responsive Text Size (text-3xl md:text-4xl lg:text-5xl) */}
            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r ${
              theme === 'dark' ? 'from-blue-400 to-purple-500' : 'from-indigo-600 to-purple-600'
            }`}>
              Library Catalog
            </h1>
            <p className={`text-base md:text-lg ${textSub}`}>
              Discover, read, and manage your collection.
            </p>
          </div>
          
          {user?.role === 'admin' && (
            <button 
              onClick={() => { setEditingBook(null); setIsModalOpen(true); }}
              // ADDED: w-full md:w-auto (Full width on mobile, auto on desktop)
              className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center gap-2 font-bold hover:-translate-y-1 active:scale-95"
            >
              <Plus className="w-5 h-5" /> Add New Book
            </button>
          )}
        </div>

        <VibeMatcher books={books} onVibeMatch={handleVibeMatch} />

        <div className={`${cardGlass} p-4 rounded-2xl shadow-lg mb-8 flex flex-col sm:flex-row gap-4 animate-slide-up`}>
          <div className="relative flex-grow">
            <Search className={`absolute left-3 top-2.5 h-5 w-5 ${textSub}`} />
            <input
              type="text"
              placeholder="Search by title or author..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${
                theme === 'dark' ? 'bg-gray-700/50 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className={`px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-colors w-full sm:w-48 ${
              theme === 'dark' ? 'bg-gray-700/50 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
            }`}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonBookCard key={i} />)
            : filteredBooks.length === 0
              ? (
                <div className={`col-span-full text-center py-20 ${textSub} animate-fade-in`}>
                  <div className="inline-block p-6 rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                    <Search className="w-12 h-12 opacity-30" />
                  </div>
                  <p className="text-lg">No books found.</p>
                </div>
              )
              : filteredBooks.map((book) => (
                  <BookCard
                    key={book._id}
                    book={book}
                    userId={user?.id}
                    onIssue={handleIssue}
                    onDelete={user?.role === 'admin' ? handleDelete : null}
                    onEdit={user?.role === 'admin' ? () => handleEditClick(book) : null}
                    onRead={setReadingBook}
                  />
                ))
          }
        </div>
      </div>

      <BookModal isOpen={isModalOpen} onClose={closeModal} book={editingBook} onAddBook={handleBookSubmit} />
      <ReadBookModal isOpen={!!readingBook} book={readingBook} onClose={() => setReadingBook(null)} />
    </div>
  );
};

export default Books;