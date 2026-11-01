import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Repeat2, MessageCircle } from 'lucide-react';
import api, { errMsg } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Empty, Skeletons, StatusBadge, Avatar } from '../components/ui.jsx';
export default function Requests() {
  const { notify } = useAuth();
  const [box, setBox] = useState('incoming');
  const [items, setItems] = useState(null);
  const [busyId, setBusyId] = useState('');
  const load = () => { setItems(null); api.get('/requests', { params: { box } }).then((r) => setItems(r.data.data)).catch((e) => notify(errMsg(e), 'err')); };
  useEffect(load, [box]);
  const act = async (id, status) => {
    setBusyId(id);
    try { await api.patch(`/requests/${id}/status`, { status }); notify(`Request ${status}`); load(); }
    catch (e) { notify(errMsg(e), 'err'); } finally { setBusyId(''); }
  };
  const tab = (k) => `rounded-full px-5 py-2 text-sm font-semibold ${box === k ? 'bg-ink text-white' : 'bg-white text-soft'}`;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold">Requests</h1>
      <div className="flex gap-2" role="tablist"><button role="tab" aria-selected={box === 'incoming'} className={tab('incoming')} onClick={() => setBox('incoming')}>Incoming</button><button role="tab" aria-selected={box === 'sent'} className={tab('sent')} onClick={() => setBox('sent')}>Sent</button></div>
      {!items ? <Skeletons n={3} /> : !items.length ? (
        <Empty icon={Inbox} title={box === 'incoming' ? 'No requests yet' : "You haven't asked anyone yet"} text={box === 'incoming' ? 'When someone wants to learn from you, it lands here.' : 'Find a skill you want and offer a swap.'} action={box === 'sent' && <Button to="/app">Discover skills</Button>} />
      ) : (
        <div className="space-y-4">{items.map((r) => {
          const other = box === 'incoming' ? r.sender : r.recipient;
          return (
            <article key={r._id} className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link to={`/app/u/${other._id}`} className="flex items-center gap-2 font-semibold"><Avatar user={other} size={32} />{other.name}</Link><StatusBadge status={r.status} /></div>
              <p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
                <span className="rounded-full bg-lav px-3 py-1">{box === 'incoming' ? r.offeredSkill?.title : r.offeredSkill?.title} (offered)</span><Repeat2 className="size-4 text-volt" />
                <span className="rounded-full bg-lav px-3 py-1">{r.requestedSkill?.title} (wanted)</span></p>
              <p className="mt-3 text-sm text-soft">“{r.message}”</p>
              <p className="mt-1 text-xs text-soft">{new Date(r.createdAt).toLocaleString()}</p>
              {r.status === 'accepted' && <div className="mt-4"><Button to={`/app/chat/${r._id}`} className="!py-2"><MessageCircle className="size-4" />Open chat</Button></div>}
              {r.status === 'pending' && <div className="mt-4 flex gap-2">
                {box === 'incoming' ? (<><Button className="!py-2" loading={busyId === r._id} onClick={() => act(r._id, 'accepted')}>Accept</Button><Button variant="danger" className="!py-2" disabled={busyId === r._id} onClick={() => act(r._id, 'rejected')}>Reject</Button></>)
                  : <Button variant="danger" className="!py-2" loading={busyId === r._id} onClick={() => act(r._id, 'cancelled')}>Cancel request</Button>}</div>}
            </article>);
        })}</div>)}
    </div>);
}
