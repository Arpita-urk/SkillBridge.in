import { Link } from 'react-router-dom';
import { Repeat2, UserPlus, Handshake, Wallet, Users, Rocket } from 'lucide-react';
import { Button } from '../components/ui.jsx';
const steps = [
  { icon: UserPlus, t: 'Post what you know', d: 'Add a skill you can teach, from React to guitar to Spanish.' },
  { icon: Repeat2, t: 'Pick what you want', d: 'Browse skills and offer one of yours in return.' },
  { icon: Handshake, t: 'Swap and grow', d: 'Once they accept, you both level up. No money involved.' }
];
const pairs = [['React', 'UI/UX design'], ['Python basics', 'Public speaking'], ['Video editing', 'Spanish'], ['Excel', 'Guitar']];
const perks = [{ icon: Wallet, t: 'Zero cost', d: 'Your skills are the currency.' }, { icon: Users, t: 'Real peers', d: 'Learn from students who just figured it out.' }, { icon: Rocket, t: 'Build a portfolio of knowledge', d: 'Teaching is the fastest way to learn.' }];
export default function Landing() {
  return (
    <div>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="font-display text-2xl font-extrabold">Skill<span className="text-volt">Bridge</span></span>
        <nav className="flex items-center gap-2"><Button variant="ghost" to="/login">Log in</Button><Button to="/register">Get started</Button></nav>
      </header>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-10 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] sm:text-6xl">You know something. They know something else. Trade.</h1>
          <p className="mt-5 max-w-md text-lg text-soft">SkillBridge matches students who swap what they know, so everyone learns something new without paying a cent.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button to="/register">Get started</Button><Button variant="soft" to="/login">Explore skills</Button></div>
        </div>
        <div aria-hidden="true" className="relative h-72 rounded-[2.5rem] bg-gradient-to-br from-lav to-[#cfd9ff] overflow-hidden">
          <div className="swap-a absolute left-8 top-10 w-44 rounded-3xl bg-white p-4 shadow-xl"><p className="text-xs font-semibold text-violet">Teaches</p><p className="font-display text-xl font-extrabold">React</p></div>
          <div className="swap-b absolute right-8 bottom-10 w-44 rounded-3xl bg-volt p-4 text-white shadow-xl"><p className="text-xs font-semibold text-white/80">Teaches</p><p className="font-display text-xl font-extrabold">UI/UX design</p></div>
          <Repeat2 className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-ink/30" />
        </div>
      </section>
      <section className="bg-white py-16"><div className="mx-auto max-w-6xl px-5">
        <h2 className="font-display text-3xl font-extrabold">How a swap works</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">{steps.map((s, i) => (<div key={i} className="rounded-3xl bg-mist p-6"><s.icon className="size-7 text-violet" /><h3 className="font-display mt-3 text-lg font-bold">{s.t}</h3><p className="mt-1 text-sm text-soft">{s.d}</p></div>))}</div>
      </div></section>
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl font-extrabold">Swaps students could make</h2>
        <p className="mt-1 text-soft text-sm">Examples to spark ideas.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">{pairs.map(([a, b]) => (<div key={a} className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 font-semibold"><span>{a}</span><Repeat2 className="size-5 text-volt" /><span>{b}</span></div>))}</div>
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-16"><div className="grid gap-5 md:grid-cols-3">{perks.map((p) => (<div key={p.t} className="flex gap-4"><p.icon className="size-6 shrink-0 text-volt" /><div><h3 className="font-display font-bold">{p.t}</h3><p className="text-sm text-soft">{p.d}</p></div></div>))}</div></section>
      <section className="mx-auto max-w-6xl px-5 pb-20"><div className="rounded-[2rem] bg-ink p-10 text-center text-white"><h2 className="font-display text-3xl font-extrabold">Ready to trade?</h2><p className="mt-2 text-white/70">Make an account and list your first skill in a minute.</p><div className="mt-6"><Button to="/register">Create your account</Button></div></div></section>
      <footer className="border-t border-lav py-6 text-center text-sm text-soft">SkillBridge. Built for students who learn together. <Link className="underline" to="/login">Log in</Link></footer>
    </div>
  );
}
