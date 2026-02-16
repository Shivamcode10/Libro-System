import { useState } from 'react';
import { Book as BookIcon, Download, Eye, Edit, Trash2, MessageSquare } from 'lucide-react';
import { Document, Page } from 'react-pdf';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const BookCard = ({ book, onEdit, onDelete, userId, onRead }) => {
  const { theme } = useTheme();
  const [numPages, setNumPages] = useState(null); 
  
  const isAvailable = book.status === 'Available';
  const isIssuedToMe = !isAvailable && (String(userId) === String(book.issuedBy));

  // --- UPDATED THEME VARIABLES FOR BETTER CONTRAST ---
  const cardBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const textMain = theme === 'dark' ? 'text-white' : 'text-gray-900';
  // Lightened textSub for dark mode (gray-400 -> gray-300) for better readability
  const textSub = theme === 'dark' ? 'text-gray-300' : 'text-gray-500';
  // Darker background for image area in dark mode to make preview pop
  const imgBg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  let renderContent;

  if (book.fileUrl) {
    if (book.fileUrl.match(/\.(jpeg|jpg|png|gif)$/i)) {
      renderContent = (
        <img 
          src={`http://localhost:5000/uploads/${book.fileUrl}`} 
          alt={book.title} 
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          loading="lazy"
        />
      );
    } 
    else if (book.fileUrl.match(/\.pdf$/i)) {
      renderContent = (
        <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-white">
           <Document
             file={`http://localhost:5000/uploads/${book.fileUrl}`}
             loading={<div className={`animate-pulse w-full h-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />}
             error={<div className="text-red-400 text-xs text-center p-4">Preview Error</div>}
             onLoadSuccess={onDocumentLoadSuccess}
           >
             <Page 
                pageNumber={1} 
                height={256} 
                className="shadow-md transition-transform duration-300 group-hover:scale-105"
                renderTextLayer={false} 
                renderAnnotationLayer={false}
             />
           </Document>
        </div>
      );
    }
  }

  if (!renderContent) {
    renderContent = (
      <div className={`flex flex-col items-center opacity-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
        <BookIcon className="w-16 h-16" />
        <span className="text-xs mt-2">No Preview</span>
      </div>
    );
  }

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
      alert("Permission denied");
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
                ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:text-white' // IMPROVED CONTRAST
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
                ? 'border-red-900/50 text-red-400 hover:bg-red-900/20' // IMPROVED CONTRAST
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