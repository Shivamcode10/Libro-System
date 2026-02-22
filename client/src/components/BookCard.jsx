import { useState } from 'react';
import { Book as BookIcon, Download, Eye, Edit, Trash2, MessageSquare, FileText } from 'lucide-react';
// ✅ REMOVED: react-pdf imports (We don't use them in the list view anymore to prevent crashes)
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BookCard = ({ book, onEdit, onDelete, userId, onRead }) => {
  const { theme } = useTheme();
  
  const isAvailable = book.status === 'Available';
  const isIssuedToMe = !isAvailable && (String(userId) === String(book.issuedBy));

  // --- THEME VARIABLES ---
  const cardBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const textMain = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSub = theme === 'dark' ? 'text-gray-300' : 'text-gray-500';
  const imgBg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';

  // ✅ HELPER FUNCTION
  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith('http')) return fileUrl;
    return `${API_BASE}/uploads/${fileUrl}`;
  };

  // ✅ IMPROVED: Simple Logic to decide what to show in the card
  // This prevents the 401 error and browser crashes
  let renderContent;

  if (book.fileUrl) {
    const isPdf = book.fileUrl.toLowerCase().endsWith('.pdf');
    const url = getFileUrl(book.fileUrl);

    if (isPdf) {
      // If it's a PDF, show a nice Icon instead of trying to render the actual PDF
      renderContent = (
        <div className={`w-full h-full flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
           <FileText className="w-16 h-16 text-red-500 mb-2" />
           <span className="text-xs font-bold text-red-500">PDF Document</span>
           <span className="text-[10px] text-gray-400 mt-1">Click details to read</span>
        </div>
      );
    } else {
      // If it's an image, show the image
      renderContent = (
        <img 
          src={url} 
          alt={book.title} 
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            // Fallback if image URL is broken (401 or 404)
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
  }

  // Fallback if no file URL
  if (!renderContent) {
    renderContent = (
      <div className={`flex flex-col items-center opacity-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
        <BookIcon className="w-16 h-16" />
        <span className="text-xs mt-2">No Preview</span>
      </div>
    );
  }

  // Hidden error container (triggered by img onError)
  const renderError = (
     <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
        <BookIcon className="w-12 h-12 text-gray-400" />
        <span className="text-xs text-gray-500">Error Loading</span>
     </div>
  );

  const handleCardDownload = async (e) => {
    e.preventDefault();
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
      console.error(error);
      alert("Permission denied or file not found.");
    }
  };

  return (
    <div className={`
      ${cardBg} border rounded-2xl
      flex flex-col group overflow-hidden relative
      shadow-lg 
      hover:-translate-y-2          
      hover:shadow-2xl            
      hover:shadow-indigo-500/30
      transition-all duration-300 ease-out
      animate-fade-in
    `}>
      
      <div className={`h-64 flex items-center justify-center text-gray-400 relative overflow-hidden ${imgBg}`}>
        {renderContent}
        {renderError} {/* Hidden fallback for broken images */}
        
        <div className="absolute top-3 left-3 z-10">
           <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm backdrop-blur-md ${
             isAvailable 
               ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
               : 'bg-red-500/20 text-red-400 border border-red-500/20'
           }`}>
             {book.status}
           </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className={`text-lg font-bold line-clamp-1 mb-1 transition-all duration-200 group-hover:text-indigo-400 group-hover:underline underline-offset-4 ${textMain}`}>
          {book.title}
        </h3>
        <p className={`text-xs mb-4 ${textSub}`}>by {book.author}</p>
        
        <div className="flex gap-2 mb-4">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {book.category}
            </span>
            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
              theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
            }`}>
              {book.pages || 0} pgs
            </span>
        </div>
        
        <div className="mt-auto grid grid-cols-2 gap-2">
          
          {/* BUTTON 1: LEFT SIDE */}
          {isIssuedToMe && book.fileUrl && (
             <button 
                onClick={handleCardDownload} 
                className="col-span-1 text-xs py-2 border border-indigo-200 text-indigo-600 dark:text-indigo-300 dark:border-indigo-800/50 rounded-xl
                hover:bg-indigo-50 dark:hover:bg-indigo-900/30
                font-medium flex justify-center items-center gap-1
                transition-all duration-150 active:scale-95"
             >
                <Download className="w-3 h-3" /> Download
             </button>
          )}

          {!isIssuedToMe && (
             <Link 
                to={`/books/${book._id}`}
                className="col-span-1 text-xs py-2 bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300 rounded-xl
                font-medium flex justify-center items-center gap-1
                hover:bg-orange-100 dark:hover:bg-orange-900/50
                transition-all duration-150 active:scale-95 no-underline text-center"
             >
                <Eye className="w-3 h-3" /> Details
             </Link>
          )}

          {/* BUTTON 2: RIGHT SIDE */}
          {onEdit && (
            <button 
              onClick={() => onEdit(book)} 
              className={`col-span-1 text-xs py-2 rounded-xl font-medium border transition-all duration-150 active:scale-95 ${
              theme === 'dark' 
                ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:text-white' 
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}>
              <Edit className="w-3 h-3 inline mr-1"/> Edit
            </button>
          )}

          {!onEdit && (
             <Link 
                to={`/books/${book._id}#reviews-section`} 
                className="col-span-1 text-xs py-2 border border-blue-200 text-blue-600 dark:text-blue-300 dark:border-blue-800/50 rounded-xl
                font-medium flex justify-center items-center gap-1
                hover:bg-blue-50 dark:hover:bg-blue-900/30
                transition-all duration-150 active:scale-95 no-underline text-center"
             >
                <MessageSquare className="w-3 h-3" /> Reviews
             </Link>
          )}

          {onDelete && (
            <button 
              onClick={() => onDelete(book._id)} 
              className={`col-span-1 text-xs py-2 rounded-xl font-medium border transition-all duration-150 active:scale-95 ${
              theme === 'dark' 
                ? 'border-red-900/50 text-red-400 hover:bg-red-900/20' 
                : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
            }`}>
              <Trash2 className="w-3 h-3 inline mr-1"/> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;