import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      const userInfoStr = localStorage.getItem('userInfo');
      
      if (token && userInfoStr) {
        try {
          const parsedUser = JSON.parse(userInfoStr);
          const safeUser = {
            ...parsedUser,
            role: parsedUser.role || 'user' 
          };
          setUser(safeUser);
        } catch (error) {
          console.error("Failed to parse user info", error);
          localStorage.removeItem('userInfo');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // Note: Since we use httpOnly cookies, the token is in the cookie, 
      // but we also store it in localStorage for quick UI checks if needed.
      // Ideally, rely on the cookie for API auth.
      
      const userData = data.user || {};
      const safeUserData = {
        ...userData,
        role: userData.role || 'user'
      };

      localStorage.setItem('userInfo', JSON.stringify(safeUserData));
      setUser(safeUserData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      await api.post('/auth/register', { name, email, password });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // ✅ FIXED: Make logout async to clear the backend cookie
  const logout = async () => {
    try {
      // Call backend to clear the httpOnly cookie
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout API Error:", error);
      // We continue with local logout even if API fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;