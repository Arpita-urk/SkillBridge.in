import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles, Inbox, Bell, UserRound, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { Avatar } from '../components/ui.jsx';
const links = [
  { to: '/app', label: 'Discover', icon: Compass, end: true },
  { to: '/app/my-skills', label: 'My skills', icon: Sparkles },
  { to: '/app/requests', label: 'Requests', icon: Inbox },
  { to: '/app/notifications', label: 'Alerts', icon: Bell, badge: true },
  { to: '/app/profile', label: 'Profile', icon: UserRound }
];
export default function AppLayout() {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const loc = useLocation();
  const navLinks = user.role === 'admin' ? [...links, { to: '/app/admin', label: 'Admin', icon: ShieldCheck }] : links;
  useEffect(() => { api.get('/notifications').then((r) => setUnread(r.data.unread)).catch(() => {}); }, [loc.pathname]);
  useEffect(() => { const h = (e) => setUnread(e.detail); window.addEventListener('sb:unread', h); return () => window.removeEventListener('sb:unread', h); }, []);
  const item = ({ isActive }) => `relative flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-white shadow-sm text-volt' : 'text-soft hover:bg-white/60'}`;
  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-1 p-5 sticky top-0 h-screen">
        <Link to="/" className="font-display text-2xl font-extrabold mb-6">Skill<span className="text-volt">Bridge</span></Link>
        {navLinks.map((l) => (<NavLink key={l.to} to={l.to} end={l.end} className={item}><l.icon className="size-5" />{l.label}
          {l.badge && unread > 0 && <span className="ml-auto rounded-full bg-volt px-2 text-xs text-white">{unread}</span>}</NavLink>))}
        <div className="mt-auto flex items-center gap-3 rounded-2xl bg-white p-3"><Avatar user={user} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.name}</p>
          <button onClick={logout} className="flex items-center gap-1 text-xs text-soft hover:text-ink"><LogOut className="size-3" />Log out</button></div></div>
      </aside>
      <main className="flex-1 min-w-0 p-4 sm:p-8 pb-28 lg:pb-8 max-w-6xl"><Outlet /></main>
      <nav aria-label="Main" className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex justify-around bg-white border-t border-lav px-2 py-2">
        {navLinks.map((l) => (<NavLink key={l.to} to={l.to} end={l.end} aria-label={l.label} className={({ isActive }) => `relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-[11px] font-semibold ${isActive ? 'text-volt' : 'text-soft'}`}>
          <l.icon className="size-5" />{l.label}{l.badge && unread > 0 && <span className="absolute -top-0.5 right-1 size-4 rounded-full bg-volt text-[10px] text-white grid place-items-center">{unread}</span>}</NavLink>))}
      </nav>
    </div>
  );
}
