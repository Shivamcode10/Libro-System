import { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // Import Theme Context

const BookModal = ({ isOpen, onClose, onAddBook }) => {
  const { theme } = useTheme(); // Get current theme
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({ title: '', author: '', category: 'Fiction', pages: '', description: '' });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setFormData(prev => ({ ...prev, title: nameWithoutExt }));
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      setError("Please enter a title.");
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([k,v]) => formDataToSend.append(k,v || ''));
    if (file) formDataToSend.append('bookFile', file);

    onAddBook(formDataToSend);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in
      ${isDark ? 'bg-black/70' : 'bg-black/40'} backdrop-blur-md`}>
      
      {/* MODAL */}
      <div className={`
        w-full max-w-md animate-scale-in rounded-2xl shadow-2xl
        ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
      `}>

        {/* Header */}
        <div className={`flex justify-between items-center p-4 border-b
          ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold flex items-center gap-2
            ${isDark ? 'text-white' : 'text-gray-800'}`}>
            <Upload className="w-5 h-5 text-indigo-500" /> Add New Book
          </h2>
          <button 
            onClick={onClose}
            className={`p-1 rounded-lg transition active:scale-90
              ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {error && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 animate-fade-in
              ${isDark ? 'bg-red-900/30 border border-red-900/50 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {/* Upload */}
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer
            ${isDark 
              ? 'border-gray-600 bg-gray-900/30 hover:border-indigo-500 hover:bg-indigo-900/20' 
              : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/40'}`}>
            <input 
              type="file" 
              id="bookFile" 
              className="hidden" 
              accept=".pdf, .jpg, .jpeg, .png" 
              onChange={handleFileChange}
            />
            <label htmlFor="bookFile" className="cursor-pointer flex flex-col items-center gap-2">
              {fileName ? (
                <>
                  <FileText className={`w-10 h-10 animate-fade-in ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  <span className={`font-medium text-sm truncate w-full ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{fileName}</span>
                </>
              ) : (
                <>
                  <Upload className={`w-10 h-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Click to upload (PDF/Image)</span>
                </>
              )}
            </label>
          </div>

          {/* Input Field Component Style */}
          {[
            ["Title *","title","text",""],
            ["Author","author","text","Leave blank if unknown"],
            ["Total Pages","pages","number","Left blank for 0 or auto-detect"]
          ].map(([label,key,type,placeholder]) => (
            <div key={key}>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
              <input 
                type={type}
                placeholder={placeholder}
                className={`w-full px-3 py-2 rounded-lg outline-none transition-all duration-150 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                  ${isDark 
                    ? 'bg-gray-900 border-gray-600 text-white focus:border-indigo-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
                  }`}
                value={formData[key]}
                onChange={e => setFormData({...formData, [key]: e.target.value})}
              />
            </div>
          ))}

          {/* Category */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
            <select 
              className={`w-full px-3 py-2 rounded-lg outline-none transition-all duration-150 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                ${isDark 
                  ? 'bg-gray-900 border-gray-600 text-white focus:border-indigo-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
                }`}
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option>Fiction</option>
              <option>Technology</option>
              <option>History</option>
              <option>Science</option>
              <option>Enginneering</option>
              <option>Coding</option>
              <option>Agriculture</option>
              <option>Other</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm rounded-lg transition-all active:scale-95
                ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Cancel
            </button>

            <button 
              type="submit"
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95"
            >
              Add Book
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BookModal;