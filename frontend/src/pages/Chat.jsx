import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Repeat2 } from 'lucide-react';
import api, { errMsg } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar, Button, Stars, StarInput } from '../components/ui.jsx';
function RatePanel({ id, name, existing, onDone }) {
  const { notify } = useAuth();
  const [open, setOpen] = useState(false), [stars, setStars] = useState(0), [comment, setComment] = useState(''), [busy, setBusy] = useState(false);
  const bar = 'border-b border-lav bg-mist px-4 py-3 text-sm';
  if (existing) return <div className={`${bar} flex items-center gap-2 text-soft`}>You rated {name}<Stars value={existing.stars} size={14} /></div>;
  if (!open) return <div className={`${bar} flex flex-wrap items-center justify-between gap-2`}><span>Learned something? Rate how {name} teaches.</span><Button variant="soft" className="!py-1.5" onClick={() => setOpen(true)}>Rate teacher</Button></div>;
  const submit = async () => {
    if (!stars) return notify('Pick 1 to 5 stars', 'err');
    setBusy(true);
    try { await api.post(`/requests/${id}/rating`, { stars, comment }); notify('Thanks for rating!'); onDone(); }
    catch (e) { notify(errMsg(e), 'err'); } finally { setBusy(false); }
  };
  return (<div className={`${bar} space-y-2`}><p className="font-semibold">How was {name} as a teacher?</p><StarInput value={stars} onChange={setStars} />
    <input aria-label="Comment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={300} placeholder="Add a short comment (optional)" className="w-full rounded-xl border border-lav bg-white px-4 py-2 text-sm" />
    <div className="flex gap-2"><Button className="!py-1.5" loading={busy} onClick={submit}>Submit rating</Button><Button variant="ghost" className="!py-1.5" onClick={() => setOpen(false)}>Not now</Button></div></div>);
}
const starters = ['Hey! When are you free this week?', 'Want to do a quick video call?', 'I will share some resources before we start.'];
const linkify = (text) => text.split(/(https?:\/\/[^\s]+)/g).map((p, i) => /^https?:\/\//.test(p) ? <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="underline break-all">{p}</a> : p);
export default function Chat() {
  const { id } = useParams();
  const { user, notify } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef(null);
  const load = () => api.get(`/requests/${id}/messages`).then((r) => { setData(r.data.data); setErr(''); }).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [id]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [data?.messages.length]);
  const send = async (value = text) => {
    if (!value.trim()) return;
    setBusy(true);
    try { await api.post(`/requests/${id}/messages`, { text: value }); setText(''); await load(); }
    catch (e) { notify(errMsg(e), 'err'); } finally { setBusy(false); }
  };
  if (err && !data) return <div className="space-y-4"><p role="alert" className="text-rose-700">{err}</p><Button variant="soft" to="/app/requests">Back to requests</Button></div>;
  if (!data) return <div className="skeleton h-96 rounded-3xl" />;
  const { request: r, messages } = data;
  const iAmSender = r.sender._id === user.id;
  const other = iAmSender ? r.recipient : r.sender;
  const learn = r.requestedSkill.title, teach = r.offeredSkill.title;
  const youLearn = iAmSender ? learn : teach, youTeach = iAmSender ? teach : learn;
  return (
    <div className="flex h-[calc(100vh-9rem)] min-h-[28rem] flex-col rounded-3xl bg-white shadow-sm lg:h-[calc(100vh-4rem)]">
      <header className="flex flex-wrap items-center gap-3 border-b border-lav p-4">
        <Link to="/app/requests" aria-label="Back" className="rounded-full p-2 hover:bg-lav"><ArrowLeft className="size-5" /></Link>
        <Avatar user={other} size={40} />
        <div className="min-w-0 flex-1"><Link to={`/app/u/${other._id}`} className="font-display font-bold hover:underline">{other.name}</Link>
          <p className="flex flex-wrap items-center gap-1.5 text-xs text-soft">You learn <b className="text-ink">{youLearn}</b><Repeat2 className="size-3.5 text-volt" />you teach <b className="text-ink">{youTeach}</b></p></div>
      </header>
      <RatePanel id={id} name={other.name.split(' ')[0]} existing={data.myRating} onDone={load} />
      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        <p className="mx-auto max-w-md rounded-2xl bg-mist p-3 text-center text-xs text-soft">You're matched! Agree on a time, share meeting links (Meet, Zoom) and resources here, then teach each other.</p>
        {!messages.length && <div className="flex flex-wrap justify-center gap-2 pt-2">{starters.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full bg-lav px-4 py-2 text-sm font-medium hover:bg-[#d6caff]">{s}</button>)}</div>}
        {messages.map((m) => { const mine = m.sender === user.id; return (
          <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-3xl px-4 py-2.5 text-sm ${mine ? 'rounded-br-md bg-volt text-white' : 'rounded-bl-md bg-lav text-ink'}`}>
              <p className="whitespace-pre-wrap break-words">{linkify(m.text)}</p>
              <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-soft'}`}>{new Date(m.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p></div></div>); })}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t border-lav p-3">
        <input aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder={`Message ${other.name.split(' ')[0]}…`} className="min-w-0 flex-1 rounded-full border border-lav px-5 py-2.5 text-sm" />
        <Button type="submit" loading={busy} aria-label="Send"><Send className="size-4" />Send</Button>
      </form>
    </div>);
}
