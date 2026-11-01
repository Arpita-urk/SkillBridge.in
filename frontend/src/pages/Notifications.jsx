import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import api, { errMsg } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Empty, Skeletons } from '../components/ui.jsx';
const sync = (n) => window.dispatchEvent(new CustomEvent('sb:unread', { detail: n }));
export default function Notifications() {
  const { notify } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState(null);
  useEffect(() => { api.get('/notifications').then((r) => setItems(r.data.data)).catch((e) => notify(errMsg(e), 'err')); }, []);
  const apply = (list) => { setItems(list); sync(list.filter((n) => !n.read).length); };
  const read = async (n) => { if (['new_message', 'request_accepted'].includes(n.type) && n.request) nav(`/app/chat/${n.request}`); if (n.read) return; try { await api.patch(`/notifications/${n._id}/read`); apply(items.map((x) => (x._id === n._id ? { ...x, read: true } : x))); } catch (e) { notify(errMsg(e), 'err'); } };
  const readAll = async () => { try { await api.patch('/notifications/read-all'); apply(items.map((x) => ({ ...x, read: true }))); notify('All caught up'); } catch (e) { notify(errMsg(e), 'err'); } };
  const unread = items?.filter((n) => !n.read).length || 0;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="font-display text-3xl font-extrabold">Alerts{unread > 0 && <span className="ml-3 rounded-full bg-volt px-3 py-1 align-middle text-sm text-white">{unread} new</span>}</h1>
        {unread > 0 && <Button variant="soft" onClick={readAll}><CheckCheck className="size-4" />Mark all read</Button>}</div>
      {!items ? <Skeletons n={3} /> : !items.length ? <Empty icon={Bell} title="All quiet" text="Swap requests and replies will show up here." /> : (
        <ul className="space-y-2">{items.map((n) => (
          <li key={n._id}><button onClick={() => read(n)} className={`flex w-full items-start gap-3 rounded-2xl p-4 text-left ${n.read ? 'bg-white/60' : 'bg-white shadow-sm'}`}>
            <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-volt'}`} />
            <span><span className="block text-sm font-medium">{n.message}</span><span className="text-xs text-soft">{new Date(n.createdAt).toLocaleString()}</span></span></button></li>))}</ul>)}
    </div>);
}
