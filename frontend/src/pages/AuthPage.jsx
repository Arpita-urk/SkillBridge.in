import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../services/api.js';
import { Button, Field } from '../components/ui.jsx';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export default function AuthPage({ mode }) {
  const reg = mode === 'register';
  const { login, register, notify } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const validate = () => {
    const e = {};
    if (reg && f.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!EMAIL.test(f.email)) e.email = 'Enter a valid email';
    if (f.password.length < (reg ? 8 : 1)) e.password = reg ? 'Use at least 8 characters' : 'Enter your password';
    if (reg && f.confirmPassword !== f.password) e.confirmPassword = 'Passwords do not match';
    setErrs(e); return !Object.keys(e).length;
  };
  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try { await (reg ? register(f) : login(f)); notify(reg ? 'Welcome to SkillBridge!' : 'Welcome back!'); nav('/app'); }
    catch (e) { setErrs({ form: errMsg(e) }); } finally { setBusy(false); }
  };
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} noValidate className="w-full max-w-md space-y-4 rounded-3xl bg-white p-8 shadow-xl">
        <Link to="/" className="font-display text-2xl font-extrabold">Skill<span className="text-volt">Bridge</span></Link>
        <h1 className="font-display text-2xl font-extrabold">{reg ? 'Create your account' : 'Welcome back'}</h1>
        {errs.form && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{errs.form}</p>}
        {reg && <Field label="Name" name="name" value={f.name} onChange={set} error={errs.name} autoComplete="name" />}
        <Field label="Email" name="email" type="email" value={f.email} onChange={set} error={errs.email} autoComplete="email" />
        <Field label="Password" name="password" type="password" value={f.password} onChange={set} error={errs.password} autoComplete={reg ? 'new-password' : 'current-password'} />
        {reg && <Field label="Confirm password" name="confirmPassword" type="password" value={f.confirmPassword} onChange={set} error={errs.confirmPassword} autoComplete="new-password" />}
        <Button type="submit" loading={busy} className="w-full">{reg ? 'Create account' : 'Log in'}</Button>
        <p className="text-center text-sm text-soft">{reg ? 'Already in?' : 'New here?'} <Link className="font-semibold text-volt" to={reg ? '/login' : '/register'}>{reg ? 'Log in' : 'Create an account'}</Link></p>
      </form>
    </div>
  );
}
