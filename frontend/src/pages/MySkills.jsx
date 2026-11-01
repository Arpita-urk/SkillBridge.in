import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Sparkles } from 'lucide-react';
import api, { errMsg } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Field, Modal, Skeletons, Empty, LevelBadge, Tag, CATEGORIES, LEVELS } from '../components/ui.jsx';
const blank = { title: '', description: '', category: 'Development', level: 'Beginner' };
function SkillForm({ skill, onClose, onSaved }) {
  const { notify } = useAuth();
  const [f, setF] = useState(skill || blank);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (f.title.trim().length < 3) v.title = 'Title needs at least 3 characters';
    if (f.description.trim().length < 10) v.description = 'Describe it in at least 10 characters';
    setErrs(v); if (Object.keys(v).length) return;
    setBusy(true);
    try {
      const body = { title: f.title, description: f.description, category: f.category, level: f.level };
      const r = skill ? await api.put(`/skills/${skill._id}`, body) : await api.post('/skills', body);
      notify(skill ? 'Skill updated' : 'Skill published'); onSaved(r.data.data);
    } catch (e2) { setErrs({ form: errMsg(e2) }); } finally { setBusy(false); }
  };
  return (
    <Modal title={skill ? 'Edit skill' : 'Share a skill'} onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        {errs.form && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{errs.form}</p>}
        <Field label="Title" name="title" value={f.title} onChange={set} error={errs.title} maxLength={80} />
        <Field label="What will you teach?" as="textarea" rows={4} name="description" value={f.description} onChange={set} error={errs.description} maxLength={600} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" as="select" name="category" value={f.category} onChange={set}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Field>
          <Field label="Level" as="select" name="level" value={f.level} onChange={set}>{LEVELS.map((c) => <option key={c}>{c}</option>)}</Field>
        </div>
        <Button type="submit" loading={busy} className="w-full">{skill ? 'Save changes' : 'Publish skill'}</Button>
      </form>
    </Modal>);
}
export default function MySkills() {
  const { notify } = useAuth();
  const [skills, setSkills] = useState(null);
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);
  const load = () => api.get('/skills', { params: { mine: true } }).then((r) => setSkills(r.data.data)).catch((e) => notify(errMsg(e), 'err'));
  useEffect(() => { load(); }, []);
  const confirmDelete = async () => {
    try { await api.delete(`/skills/${del._id}`); notify('Skill deleted'); setDel(null); load(); }
    catch (e) { notify(errMsg(e), 'err'); setDel(null); }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3"><h1 className="font-display text-3xl font-extrabold">My skills</h1><Button onClick={() => setForm('new')}><Plus className="size-4" />Share a skill</Button></div>
      {!skills ? <Skeletons n={3} /> : !skills.length ? (
        <Empty icon={Sparkles} title="Nothing shared yet" text="List something you can teach. It's your ticket to learning from others." action={<Button onClick={() => setForm('new')}>Share your first skill</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{skills.map((s) => (
          <article key={s._id} className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2"><Tag>{s.category}</Tag><LevelBadge level={s.level} /></div>
            <h3 className="font-display mt-3 text-xl font-bold">{s.title}</h3>
            <p className="mt-1 text-sm text-soft">{s.description}</p>
            <p className="mt-2 text-xs text-soft">Shared {new Date(s.createdAt).toLocaleDateString()}</p>
            <div className="mt-4 flex gap-2"><Button variant="soft" className="!py-2" onClick={() => setForm(s)}><Pencil className="size-4" />Edit</Button><Button variant="danger" className="!py-2" onClick={() => setDel(s)}><Trash2 className="size-4" />Delete</Button></div>
          </article>))}</div>)}
      {form && <SkillForm skill={form === 'new' ? null : form} onClose={() => setForm(null)} onSaved={() => { setForm(null); load(); }} />}
      {del && <Modal title="Delete this skill?" onClose={() => setDel(null)}><p className="text-sm text-soft">“{del.title}” will be removed for everyone. This can't be undone.</p>
        <div className="mt-5 flex gap-2"><Button variant="danger" onClick={confirmDelete}>Delete skill</Button><Button variant="ghost" onClick={() => setDel(null)}>Keep it</Button></div></Modal>}
    </div>);
}
