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
          // SAFETY FIX: Ensure role exists, default to 'user' if missing
          const safeUser = {
            ...parsedUser,
            role: parsedUser.role || 'user' 
          };
          setUser(safeUser);
        } catch (error) {
          console.error("Failed to parse user info", error);
          localStorage.removeItem('userInfo'); // Clear corrupted data
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      
      // Ensure the user object from backend has a role, default to 'user'
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;