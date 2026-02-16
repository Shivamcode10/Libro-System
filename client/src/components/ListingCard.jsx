import { Mail, Trash2, AlertCircle, CreditCard, CheckCircle, Package, Copy, QrCode, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { useState } from 'react';

const ListingCard = ({ item, currentUserId, onUpdate, onDelete }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isOwner = (item.seller?._id || item.sellerId) === currentUserId;
  const isBuyer = item.buyer === currentUserId;

  const [isFlipped, setIsFlipped] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.put(`/marketplace/${item._id}/status`, { status: newStatus });
      alert(`Status updated to ${newStatus}`);
      onUpdate(); 
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const getUPIString = () => {
    if (!item.upiId || item.upiId.trim() === "" || item.upiId === "undefined") return null;
    const sellerName = (item.seller && item.seller.name) ? item.seller.name : "Seller";
    return `upi://pay?pa=${item.upiId}&pn=${encodeURIComponent(sellerName)}&am=${item.price}&cu=INR`;
  };

  const upiString = getUPIString();

  const qrImageUrl = upiString 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiString)}`
    : null;

  const handleUPIPayment = () => {
    if (!upiString) {
      alert("Seller has not set up a UPI ID. Please Contact Seller directly.");
      return;
    }
    window.open(upiString, '_self');
  };

  const copyToClipboard = () => {
    if (!upiString) {
      alert("No UPI ID set for this listing.");
      return;
    }
    navigator.clipboard.writeText(item.upiId);
    alert("UPI ID copied: " + item.upiId);
  };

  return (
    <div className={`relative w-full min-h-[320px] group`} style={{ perspective: '1000px' }}>
      
      <div 
        className={`
          relative w-full h-full transition-all duration-700 ease-in-out rounded-2xl shadow-md hover:shadow-xl
          ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}
        `}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        
        {/* ==================== FRONT FACE (REARRANGED) ==================== */}
        <div 
          className="absolute inset-0 rounded-2xl flex flex-col overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Status Badge - Absolute Top Right */}
          <div className={`absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg text-[10px] font-bold shadow-md z-10
            ${
              item.status === 'Available' ? 'bg-green-500 text-white' :
              item.status === 'Processing' ? 'bg-blue-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
            {item.status.toUpperCase()} 
          </div>

          {/* CONTENT CONTAINER - Tight Padding */}
          <div className="flex-1 p-3 flex flex-col">
            
            {/* 1. TITLE */}
            <h3 className={`text-[22px] font-bold leading-tight line-clamp-2 mb-1 pr-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
  Book Name = {item.title}
</h3>


            {/* 2. AUTHOR & PRICE - Same line to save space */}
            <div className="flex items-center justify-between mb-2">
              <p className={`text-[20px]  text-gray-500 truncate max-w-[60%] ${isDark ? 'text-gray-400' : ''}`}>
                Author By = {item.author}
              </p>
              <p className={`text-[40px] text-base font-bold text-orange-600`}>
                ₹{item.price}
              </p>
            </div>

            {/* 3. CONDITION TAG */}
            <div className="mb-3">
               <span className={`text-[20px] px-2 py-0.5 rounded-md font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                Condition = {item.condition}
               </span>
            </div>

            {/* Spacer pushes buttons to bottom */}
            <div className="flex-1"></div>

            {/* 4. BUTTONS - Compact Grid */}
            <div className="mt-auto space-y-1.5">
              {item.status === 'Available' && (
                <>
                   {!isOwner ? (
                     <div className="space-y-1.5">
                       <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={handleUPIPayment}
                            className="py-1.5 rounded-lg text-[11px] font-bold bg-teal-500 text-white hover:bg-teal-600 transition-colors flex items-center justify-center gap-1 shadow-sm active:scale-95"
                          >
                            <CreditCard className="w-3 h-3" /> Pay
                          </button>
                          
                          {upiString && (
                              <button 
                              onClick={() => setIsFlipped(true)}
                              className="py-1.5 rounded-lg text-[11px] font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex items-center justify-center gap-1 shadow-sm active:scale-95"
                              >
                              <QrCode className="w-3 h-3" /> QR
                              </button>
                          )}
                       </div>
                       
                       {/* Action Row */}
                       <div className="flex gap-2">
                         <button 
                           onClick={copyToClipboard}
                           className="flex-1 py-1 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1 active:scale-95"
                         >
                           <Copy className="w-3 h-3" /> UPI ID
                         </button>
                         
                         {item.seller && item.seller.email && (
                            <button 
                               onClick={() => window.location.href = `mailto:${item.seller.email}`} 
                               className="flex-1 py-1 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1 active:scale-95"
                            >
                               <Mail className="w-3 h-3" /> Mail
                            </button>
                         )}
                       </div>
                     </div>
                   ) : (
                    <button
  onClick={() => onDelete(item._id)}
  className="
    relative w-full py-1.5 rounded-lg text-xs font-semibold
    text-red-600 dark:text-red-400
    bg-red-100 dark:bg-red-900/20
    border border-red-200 dark:border-red-800
    transition-all duration-200

    hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30
    active:scale-95

    before:absolute before:inset-0 before:rounded-lg
    before:bg-red-400 before:opacity-0 before:transition-opacity before:duration-300
    hover:before:opacity-10
  "
>
  Remove
</button>

                   )}
                </>
              )}

              {item.status === 'Processing' && (
                <>
                   {isOwner ? (
                     <div className="bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded text-[10px] text-center text-blue-600 dark:text-blue-300">
                       <Package className="w-3 h-3 mx-auto mb-1"/> Processing...
                       <button onClick={() => handleStatusUpdate('Delivered')} className="mt-0.5 w-full bg-blue-600 text-white py-0.5 rounded font-bold">Mark Delivered</button>
                     </div>
                   ) : isBuyer && (
                     <div className="text-[10px] text-center text-gray-500">Buying this. Contact seller.</div>
                   )}
                </>
              )}

              {item.status === 'Delivered' && (
                 <div className="flex items-center justify-center gap-1 text-green-600 font-bold text-xs bg-green-50 dark:bg-green-900/20 p-1.5 rounded">
                   <CheckCircle size={12} /> Delivered
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================== BACK FACE (QR CODE) ==================== */}
        <div 
          className="absolute inset-0 rounded-2xl bg-white flex flex-col items-center justify-center p-3 shadow-inner"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)' 
          }}
        >
          <div className="text-center mb-2">
            <h3 className="text-base font-bold text-gray-800 mb-0.5">Scan to Pay</h3>
            <p className="text-xs text-gray-500">
              Pay <span className="font-bold text-orange-600">₹{item.price}</span> to <span className="font-bold">{item.seller?.name || 'Seller'}</span>
            </p>
          </div>
          
          {qrImageUrl ? (
            <div 
              className="bg-white p-2 rounded-lg border border-dashed border-gray-300 cursor-pointer hover:border-indigo-500 transition-colors shadow hover:shadow-lg active:scale-95"
              onClick={() => setIsFlipped(false)} 
              title="Click to flip back"
            >
              <img 
                src={qrImageUrl} 
                alt="QR Code" 
                className="w-[160px] h-[160px] block" 
              />
            </div>
          ) : (
             <p className="text-red-500 text-sm">No UPI ID Set</p>
          )}

          <div className="flex flex-col items-center gap-1 mt-2">
             <p className="text-[10px] text-gray-400 text-center max-w-[200px]">
              Scan with Google Pay or PhonePe.
            </p>

            <button 
              onClick={() => setIsFlipped(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors active:scale-95"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ListingCard;