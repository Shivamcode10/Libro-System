import { X, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useState } from 'react';

// Set worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ReadBookModal = ({ isOpen, book, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col animate-fade-in">

      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-md text-white px-6 py-4 flex justify-between items-center border-b border-white/10">

        <div className="min-w-0">
          <h2 className="text-lg font-semibold truncate">{book.title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Page {pageNumber} of {numPages || '--'}
          </p>
        </div>

        <div className="flex gap-2 items-center">

          <button 
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(p => p - 1)}
            className="px-3 py-1.5 text-sm bg-white/10 rounded-lg transition-all hover:bg-white/20 active:scale-95 disabled:opacity-30"
          >
            Prev
          </button>

          <button 
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(p => p + 1)}
            className="px-3 py-1.5 text-sm bg-white/10 rounded-lg transition-all hover:bg-white/20 active:scale-95 disabled:opacity-30"
          >
            Next
          </button>

          <button 
            onClick={onClose}
            className="ml-2 p-2 rounded-lg transition-all hover:bg-red-500/20 hover:text-red-400 active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>

        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-grow overflow-auto flex justify-center items-start bg-gradient-to-b from-gray-800 to-gray-900 p-6">

        {loading && (
          <div className="flex items-center gap-3 text-white/80 mt-20 animate-pulse">
            <Loader2 className="animate-spin" />
            <span className="text-sm">Preparing document...</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <Document
            file={`http://localhost:5000/uploads/${book.fileUrl}`}
            onLoadSuccess={onDocumentLoadSuccess}
            error={<div className="text-red-500 p-10">Error loading PDF</div>}
          >
            <Page 
              pageNumber={pageNumber}
              width={800}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>

      </div>
    </div>
  );
};

export default ReadBookModal;
