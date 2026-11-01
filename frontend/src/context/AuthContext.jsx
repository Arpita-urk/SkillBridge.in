import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api.js';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const notify = useCallback((message, type = 'ok') => { setToast({ message, type, id: Date.now() }); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);
  useEffect(() => {
    api.get('/auth/me').then((r) => setUser(r.data.data)).catch(() => {}).finally(() => setLoading(false));
    const out = () => { setUser(null); notify('Session expired. Log in again', 'err'); };
    window.addEventListener('sb:unauthorized', out);
    return () => window.removeEventListener('sb:unauthorized', out);
  }, [notify]);
  const login = async (body) => setUser((await api.post('/auth/login', body)).data.data);
  const register = async (body) => setUser((await api.post('/auth/register', body)).data.data);
  const logout = async () => { await api.post('/auth/logout'); setUser(null); };
  return (
    <Ctx.Provider value={{ user, setUser, loading, login, register, logout, notify }}>
      {children}
      {toast && <div role="status" key={toast.id} className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl shadow-xl text-sm font-medium text-white ${toast.type === 'err' ? 'bg-rose-600' : 'bg-ink'}`}>{toast.message}</div>}
    </Ctx.Provider>
  );
}
