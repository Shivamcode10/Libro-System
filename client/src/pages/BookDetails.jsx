import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'; 
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { 
  ArrowLeft, Book, User as UserIcon, Download, Edit, Trash2, 
  Star, Send, Clock, RotateCcw, X, Save, MessageSquare 
} from 'lucide-react';

const BookDetails = () => {
  const { id } = useParams();
  const location = useLocation(); 
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isIssuedByUser, setIsIssuedByUser] = useState(false);
  const [error, setError] = useState(null);
  
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [requestMsg, setRequestMsg] = useState('');
  const [showRequest, setShowRequest] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', author: '', category: '', description: '', status: 'Available' });
  const [userNotes, setUserNotes] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // ✅ UPDATED HELPER FOR CLOUDINARY COMPATIBILITY
  const getBookCoverUrl = (fileUrl) => {
    if (!fileUrl) {
      return "https://via.placeholder.com/300x450?text=No+Cover";
    }

    // ✅ CHECK 1: If it starts with http, it's a Cloudinary URL. Use it directly!
    if (fileUrl.startsWith('http')) {
      return fileUrl; 
    }

    // CHECK 2: Legacy Localhost Data
    if (fileUrl.includes('localhost')) {
      return fileUrl.replace('http://localhost:5000', API_BASE);
    }

    // CHECK 3: Legacy Local Data (just filename)
    return `${API_BASE}/uploads/${fileUrl}`;
  };

  useEffect(() => {
    if (location.hash === '#reviews-section') {
      setTimeout(() => {
        const element = document.getElementById('reviews-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, [location.hash]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, reviewRes] = await Promise.all([
          api.get(`/books/${id}`),
          api.get(`/reviews/book/${id}`) 
        ]);

        setBook(bookRes.data);
        setReviews(reviewRes.data);

        setEditForm({
          title: bookRes.data.title,
          author: bookRes.data.author,
          category: bookRes.data.category,
          description: bookRes.data.description,
          status: bookRes.data.status
        });

        const issuedBy = String(bookRes.data.issuedBy);
        const currentUserId = String(user?._id || user?.id);

        if (bookRes.data.issuedBy && issuedBy === currentUserId) {
            setIsIssuedByUser(true);
            try {
              const noteRes = await api.get(`/issues/book/${id}/notes`);
              setUserNotes(noteRes.data.notes || '');
            } catch (e) { /* Ignore */ }
        } else {
            setIsIssuedByUser(false);
        }
      } catch (err) { 
        console.error(err);
        setError('Error loading book details.'); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]); 

  const toggleModal = () => {
    setShowEditModal(!showEditModal);
  };

  const handleReturn = async () => {
    if (!confirm(`Return "${book.title}"?`)) return;
    try {
      await api.put('/issues/return', { bookId: book._id });
      alert('Book returned successfully!');
      setIsIssuedByUser(false);
      setShowEditModal(false); 
      const { data } = await api.get(`/books/${id}`);
      setBook(data);
    } catch (error) { 
      console.error(error);
      alert(error.response?.data?.message || 'Failed to return book'); 
    }
  };

  const handleDownload = async () => {
    if (!book.fileUrl) return alert("No PDF file available.");
    try {
      const response = await api.get(`/books/${book._id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${book.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert("You don't have permission to download this book.");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${book.title}"?`)) return;
    try {
      await api.delete(`/books/${id}`);
      alert('Book deleted');
      navigate('/books'); 
    } catch (error) { alert('Failed to delete book'); }
  };

  const handleAdminSave = async () => {
    try {
      await api.put(`/books/${id}`, editForm);
      alert('Book updated successfully!');
      setShowEditModal(false);
      const { data } = await api.get(`/books/${id}`);
      setBook(data);
    } catch (error) {
      alert('Failed to update book');
    }
  };

  const handleSaveNotes = async () => {
    try {
      await api.put(`/issues/book/${id}/notes`, { notes: userNotes });
      alert('Notes saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to save notes');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
        await api.post('/reviews', { bookId: id, rating: newReview.rating, comment: newReview.comment });
        alert('Review submitted!');
        setNewReview({ rating: 5, comment: '' });
        const { data } = await api.get(`/reviews/book/${id}`);
        setReviews(data);
    } catch (err) { alert('Failed to submit review'); }
  };

  const handleRequestBook = async () => {
    if(!requestMsg) return alert("Please tell us why you need this book.");
    try {
        await api.post('/requests', { 
            bookId: book._id, 
            bookTitle: book.title, 
            author: book.author, 
            message: requestMsg 
        });
        alert('Request sent to Admin!');
        setShowRequest(false);
    } catch (err) { alert('Failed to send request'); }
  };

  const scrollToReviews = () => {
    setShowEditModal(false);
    setTimeout(() => {
      document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;
  if (!book) return null;

  const userRole = user?.role || 'user';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 animate-fade-in pb-20 pt-24">
      <div className="mb-6">
        <Link to="/books" className="inline-flex items-center text-gray-500 hover:text-indigo-600">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* IMAGE CONTAINER */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 flex items-center justify-center relative h-fit">
          <div className="absolute top-4 left-4 z-10">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
              book.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {book.status}
            </span>
          </div>
          <div className="relative w-64 md:w-80 h-96 shadow-2xl rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
            {/* ✅ UPDATED: Using the helper function */}
            <img
              src={getBookCoverUrl(book.fileUrl)} 
              alt="Book Cover"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "https://via.placeholder.com/300x450?text=Error+Loading+Image";
              }}
            />
          </div>
        </div>

        {/* DETAILS CONTAINER */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-col h-full">
          <div className="mb-6">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md uppercase tracking-wide mb-3 inline-block">
              {book.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">{book.title}</h1>
            <p className="text-xl text-gray-600 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-indigo-500" /> by {book.author}
            </p>
          </div>
          
          <p className="text-gray-700 leading-relaxed mb-8 border-l-4 border-indigo-200 pl-4">
            {book.description || 'No description available for this book.'}
          </p>

          <div className="mt-auto space-y-3">
            {user && user.role === 'user' && (
              <>
                {isIssuedByUser ? (
                  <div className="flex gap-3">
                    <button onClick={handleDownload} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg flex justify-center items-center gap-2">
                      <Download className="w-5 h-5" /> Download PDF
                    </button>
                    <button onClick={handleReturn} className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition shadow-lg flex justify-center items-center gap-2">
                      <RotateCcw className="w-5 h-5" /> Return
                    </button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => setShowRequest(!showRequest)} className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition shadow-lg flex justify-center items-center gap-2">
                      <Send className="w-5 h-5" /> Request Access
                    </button>
                    {showRequest && (
                      <div className="mt-2 p-4 bg-orange-50 rounded-lg animate-fade-in">
                        <p className="text-xs font-bold text-gray-700 mb-2">Why do you need this book?</p>
                        <textarea 
                          value={requestMsg} 
                          onChange={(e) => setRequestMsg(e.target.value)} 
                          className="w-full p-2 border rounded text-sm text-gray-700" 
                          placeholder="E.g. Required for final year project..." 
                        ></textarea>
                        <button onClick={handleRequestBook} className="mt-2 text-xs bg-orange-600 text-white px-4 py-1.5 rounded hover:bg-orange-700 transition">Send Request</button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            <div className="flex gap-3 mt-3">
              {user && (
                 <button onClick={toggleModal} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 flex justify-center items-center gap-2">
                    <Edit className="w-4 h-4" /> Options
                 </button>
              )}

              {user && user.role === 'admin' && (
                <button onClick={handleDelete} className="flex-1 bg-red-50 text-red-600 py-3 rounded-lg font-medium hover:bg-red-100 flex justify-center items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* REVIEWS LIST */}
        <div id="reviews-section" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Star className="fill-yellow-400 text-yellow-400" /> Community Reviews
            </h3>
            <p className="text-indigo-100 text-sm mt-1">{reviews.length} Reviews</p>
          </div>
          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
             {reviews.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <Book className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No reviews yet. Be the first!</p>
              </div>
            )}
            {reviews.map(r => (
              <div key={r._id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 shadow-sm flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-500 font-bold">
                  {r.user?.name ? r.user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{r.user?.name || 'Anonymous'}</span>
                    <div className="flex text-yellow-500 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`${i < r.rating ? 'fill-yellow-500' : 'text-gray-300'}`} size={14}/>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WRITE REVIEW */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 h-fit sticky top-24">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" /> Write a Review
          </h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`cursor-pointer transition-transform hover:scale-110 w-8 h-8 ${newReview.rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} onClick={() => setNewReview({...newReview, rating: star})} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">Your Thoughts</p>
              <textarea 
                className="w-full p-3 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none h-32" 
                placeholder="Share your experience with this book..." 
                required 
                value={newReview.comment} 
                onChange={e => setNewReview({...newReview, comment: e.target.value})}
              ></textarea>
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg text-sm font-bold hover:bg-gray-800 transition shadow-lg flex justify-center items-center gap-2">
              <Send className="w-4 h-4" /> Submit Review
            </button>
          </form>
        </div>

      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-fade-in">
            <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {userRole === 'admin' ? 'Edit Book Details' : 'My Book Options'}
              </h2>
              <button onClick={toggleModal} className="text-gray-500 hover:text-gray-800">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {userRole === 'admin' && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700">Title</label><input type="text" className="w-full border rounded p-2  text-gray-700" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Author</label><input type="text" className="w-full border rounded p-2  text-gray-700" value={editForm.author} onChange={e => setEditForm({...editForm, author: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Category</label><input type="text" className="w-full border rounded p-2  text-gray-700" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Status</label><select className="w-full border rounded p-2  text-gray-700" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}><option value="Available">Available</option><option value="Issued">Issued</option></select></div>
                  <button onClick={handleAdminSave} className="w-full bg-indigo-600  text-white py-2 rounded font-semibold hover:bg-indigo-700">Save Changes</button>
                </div>
              )}
              {userRole === 'user' && (
                <div className="space-y-6">
                  {isIssuedByUser ? (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                      <h3 className="font-bold text-orange-800 mb-2">Return Book</h3>
                      <button onClick={handleReturn} className="w-full bg-orange-500 text-white py-2 rounded font-semibold hover:bg-orange-600 flex justify-center items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Return Book Now
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">You need to issue this book to see options.</div>
                  )}
                  {isIssuedByUser && (
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><Save className="w-4 h-4"/> My Private Notes</h3>
                      <textarea className="w-full border rounded p-3 text-sm h-32  text-gray-800" value={userNotes} onChange={(e) => setUserNotes(e.target.value)}></textarea>
                      <button onClick={handleSaveNotes} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">Save Notes</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetails;