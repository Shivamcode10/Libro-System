import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, MessageSquare, Send, X, Users } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import L from 'leaflet'; // Ensure L is imported for marker icons

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Community = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  // ✅ ADD API BASE URL
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [mapCenter, setMapCenter] = useState([20, 0]); 
  const [mapZoom, setMapZoom] = useState(2);

  // ✅ ADD HELPER FUNCTION
  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    // If it's already a full valid URL (and NOT localhost), return it
    if (avatar.startsWith('http') && !avatar.includes('localhost')) return avatar;
    // If it contains localhost, REPLACE it
    if (avatar.includes('localhost')) {
      return avatar.replace('http://localhost:5000', API_BASE);
    }
    // Otherwise, assume it's just a filename
    return `${API_BASE}/uploads/${avatar}`;
  };

  // 1. FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/user/community');
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // 2. FETCH MESSAGES
  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          const res = await api.get(`/messages/${selectedUser._id}`);
          setMessages(res.data);
        } catch (err) {
          console.error("Failed to fetch messages:", err);
        }
      };
      fetchMessages();
      setIsChatOpen(true);
      setMapCenter([selectedUser.lat, selectedUser.lng]);
      setMapZoom(14);
    }
  }, [selectedUser]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedUser) return;
    
    try {
      const res = await api.post('/messages', {
        receiverId: selectedUser._id,
        text: inputMessage
      });
      setMessages(prev => [...prev, res.data]);
      setInputMessage('');
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Community...</div>;

  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col md:flex-row relative overflow-hidden bg-gray-50 dark:bg-gray-900">
      
      {/* --- USER LIST --- */}
      <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-20 shadow-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 dark:bg-gray-900">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5" /> Community
          </h2>
          <p className="text-xs text-indigo-200 mt-1">Find readers near you</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {users.length === 0 ? (
             <p className="text-center text-gray-500 text-sm mt-4">No other users found.</p>
          ) : (
            users.map(u => (
              <div 
                key={u._id}
                onClick={() => handleUserClick(u)}
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 group hover:bg-indigo-50 dark:hover:bg-gray-700 ${selectedUser?._id === u._id ? 'bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-gray-800 border border-transparent'}`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden shrink-0">
                  {u.avatar ? (
                    // ✅ FIXED: Use helper function
                    <img src={getAvatarUrl(u.avatar)} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{u.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{u.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {u.address}
                  </p>
                </div>
                <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- MAP (SATELLITE + NAMES ONLY) --- */}
      <div className="flex-1 relative z-10">
        <MapContainer center={mapCenter} zoom={mapZoom} className="w-full h-full">
          <ChangeView center={mapCenter} zoom={mapZoom} />
          
          {/* LAYER 1: SATELLITE IMAGERY */}
          <TileLayer
            url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          />

          {/* LAYER 2: CITY/VILLAGE NAMES (Overlaid on Satellite) */}
          <TileLayer
            url='https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
            attribution=''
            transparent={true} 
            zIndex={1000} // Ensures names appear ON TOP of the satellite image
          />

          {users.filter(u => u.lat !== 0 && u.lng !== 0).map(u => (
            <Marker key={u._id} position={[u.lat, u.lng]}>
              <Popup>
                <div className="text-center p-1 min-w-[150px]">
                  <div className="font-bold text-sm mb-1">{u.name}</div>
                  <div className="text-xs text-gray-600 mb-2">{u.address}</div>
                  <button 
                    onClick={() => handleUserClick(u)}
                    className="w-full bg-indigo-600 text-white text-xs py-1 px-3 rounded hover:bg-indigo-700 shadow-sm transition"
                  >
                    Chat Now
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* --- CHAT WIDGET --- */}
      {isChatOpen && selectedUser && (
        <div className="absolute bottom-4 right-4 md:right-8 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 animate-slide-up overflow-hidden h-[550px]">
          
          {/* Header */}
          <div className="bg-indigo-600 p-4 flex items-center justify-between text-white shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                 <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm overflow-hidden border-2 border-white/30">
                    {selectedUser.avatar ? (
                       // ✅ FIXED: Use helper function
                      <img src={getAvatarUrl(selectedUser.avatar)} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{selectedUser.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-600"></div>
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">{selectedUser.name}</h3>
                <p className="text-[10px] text-indigo-200">Active now</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
            {messages.map(msg => {
              const senderObj = typeof msg.sender === 'object' ? msg.sender : null;
              const senderId = senderObj ? senderObj._id : msg.sender;
              const senderName = senderObj ? senderObj.name : 'Unknown';
              const senderAvatar = senderObj ? senderObj.avatar : null;

              const isMe = senderId === user._id;
              
              return (
                <div key={msg._id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 overflow-hidden mb-1">
                       {senderAvatar ? (
                          // ✅ FIXED: Use helper function
                          <img src={getAvatarUrl(senderAvatar)} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">
                            {senderName.charAt(0)}
                          </div>
                        )}
                    </div>
                  )}

                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    {!isMe && <span className="text-[10px] text-gray-500 mb-1 ml-1">{senderName}</span>}
                    
                    <div className={`px-4 py-2 shadow-sm text-sm leading-relaxed break-words ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-600'
                    }`}>
                      {msg.text}
                    </div>
                    
                    <span className="text-[9px] text-gray-400 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {messages.length === 0 && (
              <div className="text-center text-xs text-gray-400 mt-10">
                Say hello to <strong>{selectedUser.name}</strong>! 👋
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2 shrink-0">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 dark:bg-gray-900 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all"
            />
            <button 
              onClick={sendMessage}
              className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50 shrink-0"
              disabled={!inputMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

export default Community;