import { useEffect, useState } from 'react';
import { Users, Book, Trash2, Shield, Activity, Clock, BookOpen, Check, X } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../utils/toast';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl flex items-center justify-between transition-all hover:-translate-y-1 hover:shadow-lg">
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
    </div>
    <div className={`p-4 rounded-xl ${color}/10`}>
      <Icon className={`w-8 h-8 ${color}`} />
    </div>
  </div>
);

const AdminDashboard = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]); 
  const [stats, setStats] = useState({ totalUsers: 0, totalBooks: 0, issues: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Try to fetch Requests separately
      let reqData = [];
      try {
          const reqRes = await api.get('/requests/all');
          reqData = reqRes.data;
      } catch (err) {
          console.log("Requests endpoint not found or user not admin:", err);
      }

      // 2. Fetch Users and Books
      const [usersRes, booksRes] = await Promise.all([
        api.get('/user/all'),
        api.get('/books')
      ]);

      setUsers(usersRes.data);
      setRequests(reqData);

      // Calculate Stats
      const pendingCount = reqData.filter(r => r.status === 'Pending').length;

      setStats({
        totalUsers: usersRes.data.length,
        totalBooks: booksRes.data.length,
        issues: booksRes.data.filter(b => b.status !== 'Available').length,
        pendingRequests: pendingCount
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', message: 'Failed to load dashboard data.' });
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user ${userName}?`)) return;
    try {
      await api.delete(`/user/delete/${userId}`);
      fetchDashboardData();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Could not delete user.' });
    }
  };

  // Handle Request Status Update
  const handleRequestUpdate = async (reqId, status) => {
    try {
      const res = await api.put(`/requests/${reqId}`, { status });
      addToast({ type: 'success', title: 'Success', message: `Request ${status}` });
      fetchDashboardData(); // Refresh
    } catch (err) {
      console.error("❌ Update Request Error:", err); // Log to console for debugging
      
      // Show specific error message from backend if available
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to update request';
      
      addToast({ type: 'error', title: 'Error', message: errorMessage });
      
      // Also alert just in case
      alert(`Error: ${errorMessage}`);
    }
  };

  if (loading)
    return <div className="p-20 text-center text-indigo-500 animate-pulse">Loading system data...</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">

      {/* HEADER */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Admin Command Center</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Library analytics & user demand management</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white shadow">
          <Shield className="w-5 h-5" />
          <span className="font-semibold">Admin Mode</span>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="text-blue-500" />
        <StatCard title="Total Books" value={stats.totalBooks} icon={Book} color="text-indigo-500" />
        <StatCard title="Active Issues" value={stats.issues} icon={BookOpen} color="text-purple-500" />
        <StatCard title="Pending Requests" value={stats.pendingRequests} icon={Activity} color="text-orange-500" />
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* USER TABLE */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" /> Registered Users
            </h2>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
              {users.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700/40 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-6 py-4 text-left">User</th>
                  <th className="px-6 py-4 text-left">Role</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-semibold ${
                        user.role === 'admin'
                          ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition active:scale-90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDE PANEL: REQUESTS */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl h-full">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="text-orange-500 w-5 h-5" /> Book Requests
            </h3>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {requests.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No pending requests.</p>
              ) : (
                requests.map(req => (
                  <div key={req._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        req.status === 'Pending' 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : req.status === 'Approved' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {req.status}
                      </span>
                      
                      {/* Action Buttons for Pending Requests */}
                      {req.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleRequestUpdate(req._id, 'Approved')} className="text-green-600 hover:bg-green-50 p-1 rounded" title="Approve">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleRequestUpdate(req._id, 'Rejected')} className="text-red-600 hover:bg-red-50 p-1 rounded" title="Reject">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{req.bookTitle}</h4>
                    <p className="text-xs text-gray-500 mb-1">by {req.author}</p>
                    {req.message && (
                      <p className="text-xs text-gray-400 italic bg-gray-50 dark:bg-white/5 p-2 rounded mt-2">
                        "{req.message}"
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-2">Requested by: {req.user?.name || 'Unknown'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;