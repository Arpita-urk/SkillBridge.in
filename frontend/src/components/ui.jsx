import { X, Loader2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
export const CATEGORIES = ['Development', 'Design', 'Data', 'Marketing', 'Languages', 'Music', 'Writing', 'Business', 'Other'];
export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const variants = {
  primary: 'bg-volt text-white hover:bg-[#1f46e0] shadow-[0_6px_20px_-6px_rgba(47,91,255,.6)]',
  soft: 'bg-lav text-ink hover:bg-[#d6caff]',
  ghost: 'text-ink hover:bg-lav',
  danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100'
};
export function Button({ variant = 'primary', loading, className = '', children, to, ...p }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <button className={cls} disabled={loading || p.disabled} {...p}>{loading && <Loader2 className="size-4 animate-spin" />}{children}</button>;
}
const field = 'w-full rounded-xl border border-lav bg-white px-4 py-2.5 text-sm placeholder:text-soft/60 focus:border-volt';
export function Field({ label, error, as = 'input', children, ...p }) {
  const Tag = as; const id = p.id || p.name;
  return (<div><label htmlFor={id} className="block text-sm font-semibold mb-1.5">{label}</label>
    <Tag id={id} className={field} aria-invalid={!!error} {...p}>{children}</Tag>
    {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}</div>);
}
export const Select = ({ className = '', ...p }) => <select className={`${field} w-auto ${className}`} {...p} />;
const levelColor = { Beginner: 'bg-emerald-100 text-emerald-800', Intermediate: 'bg-amber-100 text-amber-800', Advanced: 'bg-fuchsia-100 text-fuchsia-800' };
export const LevelBadge = ({ level }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelColor[level]}`}>{level}</span>;
export const Tag = ({ children }) => <span className="rounded-full bg-lav px-2.5 py-0.5 text-xs font-semibold text-violet">{children}</span>;
const statusColor = { pending: 'bg-amber-100 text-amber-800', accepted: 'bg-emerald-100 text-emerald-800', rejected: 'bg-rose-100 text-rose-800', cancelled: 'bg-slate-200 text-slate-700' };
export const StatusBadge = ({ status }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColor[status]}`}>{status}</span>;
export function Avatar({ user, size = 40 }) {
  const style = { width: size, height: size };
  if (user?.avatar) return <img src={user.avatar} alt="" style={style} className="rounded-full object-cover" />;
  return <span style={{ ...style, fontSize: size / 2.4 }} className="grid place-items-center rounded-full bg-gradient-to-br from-violet to-volt text-white font-bold shrink-0">{(user?.name || '?')[0].toUpperCase()}</span>;
}
export function Modal({ title, onClose, children }) {
  return (<div className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink/50" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
    <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg max-h-[90vh] overflow-auto rounded-3xl bg-white p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4"><h2 className="font-display text-xl font-extrabold">{title}</h2>
        <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-lav"><X className="size-5" /></button></div>{children}</div></div>);
}
export const Skeletons = ({ n = 6 }) => <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: n }, (_, i) => <div key={i} className="skeleton h-44 rounded-3xl" />)}</div>;
export const Empty = ({ icon: Icon, title, text, action }) => (<div className="rounded-3xl border-2 border-dashed border-lav bg-white/60 p-10 text-center">
  <Icon className="mx-auto size-9 text-violet" /><h3 className="font-display text-lg font-bold mt-3">{title}</h3><p className="text-soft text-sm mt-1 max-w-sm mx-auto">{text}</p>{action && <div className="mt-4">{action}</div>}</div>);
export const Stars = ({ value = 0, size = 16 }) => (
  <span role="img" aria-label={`${Number(value).toFixed(1)} out of 5 stars`} className="inline-flex">{[1, 2, 3, 4, 5].map((i) => <Star key={i} style={{ width: size, height: size }} className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-lav'} />)}</span>);
export function StarInput({ value, onChange }) {
  return (<div role="radiogroup" aria-label="Rating" className="flex gap-1">{[1, 2, 3, 4, 5].map((i) => (
    <button type="button" key={i} role="radio" aria-checked={value === i} aria-label={`${i} star${i > 1 ? 's' : ''}`} onClick={() => onChange(i)} className="rounded p-0.5">
      <Star className={`size-7 ${i <= value ? 'fill-amber-400 text-amber-400' : 'text-lav'}`} /></button>))}</div>);
}
