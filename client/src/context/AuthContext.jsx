import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import socket from '../utils/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('taskdone_token');
    const saved = localStorage.getItem('taskdone_user');
    if (token && saved) {
      setUser(JSON.parse(saved));
      socket.connect();
      api.get('/auth/me').then(res => {
        setUser(res.data);
        localStorage.setItem('taskdone_user', JSON.stringify(res.data));
      }).catch(() => {
        localStorage.removeItem('taskdone_token');
        localStorage.removeItem('taskdone_user');
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('taskdone_token', res.data.token);
    localStorage.setItem('taskdone_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    socket.connect();
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('taskdone_token', res.data.token);
    localStorage.setItem('taskdone_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    socket.connect();
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('taskdone_token');
    localStorage.removeItem('taskdone_user');
    setUser(null);
    socket.disconnect();
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('taskdone_user', JSON.stringify(res.data));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
