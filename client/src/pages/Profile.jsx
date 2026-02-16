import React, { useState, useEffect } from 'react';
import {
  User, Mail, MapPin, Phone, Book, Lock,
  Camera, Edit2, LogOut, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

// ✅ ADD THIS CONSTANT
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
  const { user: authUser, logout } = useAuth();
  const { theme } = useTheme();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [issueCount, setIssueCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [isPasswordModal, setIsPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '' });

  const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMain = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSub = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: userData } = await api.get('/user/me');
        setUser(userData);
        setFormData({
          name: userData.name,
          phone: userData.phone || '',
          address: userData.address || ''
        });

        const { data: historyData } = await api.get('/issues/history');
        setIssueCount(historyData.length);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file); 

    try {
      const { data } = await api.post('/user/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // ✅ Updated state with cache busting
      const updatedUser = { 
        ...data.user, 
        avatar: `${data.user.avatar}?t=${new Date().getTime()}` 
      };
      
      setUser(updatedUser); 
      alert("Avatar updated successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload avatar");
    }
  };

  const handleUpdateProfile = async () => {
    try {
        const { data } = await api.put('/user/me', formData);
        setUser(data); 
        setIsEditing(false);
        alert("Profile updated successfully!");
    } catch (error) {
        alert(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
      if(passwordData.new.length < 6) {
          return alert("Password must be at least 6 characters");
      }
      try {
          await api.put('/user/change-password', passwordData);
          alert("Password changed successfully!");
          setIsPasswordModal(false);
          setPasswordData({ current: '', new: '' });
      } catch (error) {
          alert(error.response?.data?.message || "Failed to change password");
      }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  }

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-indigo-500 font-semibold text-xl animate-pulse">
        Preparing profile...
      </div>
    );

  // ✅ ROBUST HELPER FUNCTION TO FIX AVATAR URL
  const getAvatarUrl = (avatar) => {
    if (!avatar) return `https://ui-avatars.com/api/?name=${user?.name}&background=random`;
    
    // 1. If it's already a full valid URL (and NOT localhost), return it
    if (avatar.startsWith('http') && !avatar.includes('localhost')) return avatar;

    // 2. If it contains localhost (OLD DATA), REPLACE it with the live API URL
    if (avatar.includes('localhost')) {
      return avatar.replace('http://localhost:5000', API_BASE);
    }

    // 3. Otherwise, assume it's just a filename (NEW DATA) and prepend the API base
    return `${API_BASE}/uploads/${avatar}`;
  };

  return (
    <div className={`${bgClass} min-h-screen py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className={`text-3xl font-bold tracking-tight ${textMain}`}>My Profile</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className={`${cardBg} rounded-2xl border p-6 sticky top-6 transition-all hover:shadow-xl`}>
              <div className="flex flex-col items-center mb-6">
                <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden relative group">
                  <img
                    // ✅ UPDATED: Use the helper function
                    src={getAvatarUrl(user?.avatar)}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <Camera className="text-white w-6 h-6" />
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAvatarUpload} 
                    />
                  </label>
                </div>

                <h2 className={`text-xl font-bold mt-3 ${textMain}`}>{user?.name}</h2>
                <span className="px-3 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-500 rounded-full mt-1">
                  {user?.role}
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { icon: Mail, label: 'Email', value: user?.email },
                  { icon: Phone, label: 'Phone', value: user?.phone || 'Not added' },
                  { icon: MapPin, label: 'Address', value: user?.address || 'Not added' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition">
                    <item.icon className="text-indigo-500" size={18} />
                    <div>
                      <p className={`text-xs ${textSub}`}>{item.label}</p>
                      <p className={`text-sm font-medium ${textMain}`}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${cardBg} p-5 rounded-2xl border flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all`}>
                <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-500">
                  <Book className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-sm ${textSub}`}>Books Issued</p>
                  <p className={`text-2xl font-bold ${textMain}`}>{issueCount}</p>
                </div>
              </div>
              <div className={`${cardBg} p-5 rounded-2xl border flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all`}>
                <div className="p-3 rounded-xl bg-purple-500/20 text-purple-500">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-sm ${textSub}`}>Membership Points</p>
                  <p className={`text-2xl font-bold ${textMain}`}>{issueCount * 10}</p>
                </div>
              </div>
            </div>

            <div className={`${cardBg} p-6 rounded-2xl border`}>
              <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold ${textMain}`}>Personal Information</h3>
                  {!isEditing && (
                      <button onClick={() => setIsEditing(true)} className="text-indigo-500 text-sm font-semibold hover:underline">Edit</button>
                  )}
              </div>
              
              {isEditing ? (
                  <div className="space-y-4 animate-fade-in">
                      <div>
                          <label className={`block text-sm font-medium mb-1 ${textSub}`}>Full Name</label>
                          <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                          />
                      </div>
                      <div>
                          <label className={`block text-sm font-medium mb-1 ${textSub}`}>Phone</label>
                          <input 
                            type="text" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                          />
                      </div>
                      <div>
                          <label className={`block text-sm font-medium mb-1 ${textSub}`}>Address</label>
                          <input 
                            type="text" 
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                          />
                      </div>
                      <div className="flex gap-2 pt-2">
                          <button onClick={handleUpdateProfile} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Save Changes</button>
                          <button onClick={() => setIsEditing(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg">Cancel</button>
                      </div>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg">
                          <span className={`text-xs ${textSub} block`}>Name</span>
                          <span className={`font-medium ${textMain}`}>{user?.name}</span>
                      </div>
                      <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg">
                          <span className={`text-xs ${textSub} block`}>Phone</span>
                          <span className={`font-medium ${textMain}`}>{user?.phone || '-'}</span>
                      </div>
                      <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg md:col-span-2">
                          <span className={`text-xs ${textSub} block`}>Address</span>
                          <span className={`font-medium ${textMain}`}>{user?.address || '-'}</span>
                      </div>
                  </div>
              )}
            </div>

            <div className={`${cardBg} p-6 rounded-2xl border`}>
                <h3 className={`text-lg font-semibold mb-4 ${textMain}`}>Security</h3>
                <div className="flex items-center justify-between p-4 rounded-xl bg-black/5 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <Lock className="text-indigo-500 w-5 h-5" />
                        <span className={textMain}>Password</span>
                    </div>
                    <button onClick={() => setIsPasswordModal(true)} className="text-indigo-500 text-sm font-semibold hover:underline">Change Password</button>
                </div>
            </div>
          </div>
        </div>

        {isPasswordModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className={`${cardBg} p-6 rounded-2xl w-full max-w-md`}>
                    <h3 className={`text-xl font-bold mb-4 ${textMain}`}>Change Password</h3>
                    <div className="space-y-4">
                        <input 
                            type="password" 
                            placeholder="Current Password"
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                        />
                        <input 
                            type="password" 
                            placeholder="New Password"
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setIsPasswordModal(false)} className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                            <button onClick={handleChangePassword} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Update Password</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Profile;