import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import History from './pages/History';
import Marketplace from './pages/Marketplace'; 
import Community from './pages/Community';
import Reader from './pages/Reader';

import Loader from './components/Loader';
import Toaster from './components/Toaster';
import { ThemeProvider } from './context/ThemeContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user || user.role?.toLowerCase() !== 'admin') {
    return <Navigate to="/books" />; 
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="w-full min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Toaster />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Home />} />
                
                <Route path="books" element={<Books />} />
                <Route path="books/:id" element={<BookDetails />} />
                
                {/* --- NEW MARKETPLACE ROUTE --- */}
                <Route path="marketplace" element={<Marketplace />} />
                 
               <Route path="community" element={<Community />} />

               <Route path="reader/:id" element={<Reader />} /> 

                <Route path="admin-dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                
                <Route path="history" element={<History />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
