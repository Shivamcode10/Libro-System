import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ListingCard from '../components/ListingCard';
import { ShoppingBag, Plus } from 'lucide-react';

const Marketplace = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // UPDATED: Changed paypalLink to upiId
  const [formData, setFormData] = useState({ 
    title: '', 
    author: '', 
    price: '', 
    condition: 'Good', 
    upiId: '' 
  });

  const pageBg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const textMain = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSub = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data } = await api.get('/marketplace'); 
      setListings(data);
    } catch (error) {
      console.error("Failed to fetch listings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/marketplace/${id}`);
      setListings(listings.filter(l => l._id !== id));
    } catch (error) {
      alert("Failed to delete");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/marketplace', formData);
      alert("Listed successfully!");
      setIsModalOpen(false);
      // UPDATED: Reset form with upiId
      setFormData({ title: '', author: '', price: '', condition: 'Good', upiId: '' });
      fetchListings();
    } catch (error) {
      alert("Failed to list book");
    }
  };

  return (
    <div className={`${pageBg} min-h-screen`}>
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className={`text-3xl font-extrabold tracking-tight ${textMain} flex items-center gap-2`}>
              <ShoppingBag className="text-orange-500" /> Marketplace
            </h1>
            <p className={textSub}>Buy and sell books within your community.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 justify-center"
          >
            <Plus className="w-5 h-5" /> Sell a Book
          </button>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No books for sale yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {listings.map((item) => (
              <ListingCard 
                key={item._id} 
                item={item} 
                currentUserId={user?._id || user?.id} 
                onDelete={handleDelete} 
                onUpdate={fetchListings} 
              />
            ))}
          </div>
        )}

        {/* Sell Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${textMain}`}>Sell Your Book</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSub}`}>Title</label>
                  <input required type="text" className="w-full px-4 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-600 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSub}`}>Author</label>
                  <input required type="text" className="w-full px-4 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-600 outline-none" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSub}`}>Price (₹)</label>
                  <input required type="number" className="w-full px-4 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-600 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSub}`}>Condition</label>
                  <select className="w-full px-4 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-600 outline-none" value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}>
                    <option>Brand New</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>
                
                {/* UPDATED INPUT FOR UPI ID */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSub}`}>
                    UPI ID (Google Pay / PhonePe)
                  </label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-600 outline-none text-sm"
                    placeholder="e.g. name@okhdfc or name@ybl"
                    value={formData.upiId}
                    onChange={e => setFormData({...formData, upiId: e.target.value})}
                  />
                  <p className={`text-xs mt-1 ${textSub}`}>
                    Enter your UPI ID. Buyer will be redirected to their payment app.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600">List Book</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;