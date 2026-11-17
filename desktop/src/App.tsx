import { useState } from 'react';
import { create } from 'zustand';
import { copy, type Language } from './i18n';

type Store = { language: Language; selected: number; setLanguage: (v: Language) => void; select: (v: number) => void };
const useStudio = create<Store>((set) => ({
  language: localStorage.getItem('ai-ppt-language') === 'en' ? 'en' : 'zh',
  selected: 0,
  setLanguage: (language) => { localStorage.setItem('ai-ppt-language', language); set({ language }); },
  select: (selected) => set({ selected }),
}));

export default function App() {
  const { language, setLanguage, selected, select } = useStudio();
  const [projectNumber, setProjectNumber] = useState(1);
  const t = copy[language];
  const slides = [
    { name: t.pageOne, title: t.slideTitle, body: t.slideBody },
    { name: t.pageTwo, title: t.slide2Title, body: t.slide2Body },
  ];
  return <div className="app">
    <header className="topbar"><div className="brand"><span className="logo">A</span><div><strong>AI PPT Studio</strong><small>{t.subtitle}</small></div></div>
      <div className="actions"><select aria-label="Language" value={language} onChange={(e) => setLanguage(e.target.value as Language)}><option value="zh">中文</option><option value="en">English</option></select><button onClick={() => { setProjectNumber(n => n + 1); select(0); }}>{t.newProject}</button><button className="primary" disabled title={t.export}>{t.export}</button></div>
    </header>
    <div className="workspace"><aside className="sidebar"><div className="section-title">{t.pages} <span>02</span></div>{slides.map((slide, index) => <button key={index} className={'slide-thumb ' + (selected === index ? 'active' : '')} onClick={() => select(index)}><span className="thumb-number">{index + 1}</span><span className="thumb-preview"><b>{slide.title}</b><small>{slide.body}</small></span><span className="thumb-label">{slide.name}</span></button>)}</aside>
      <main className="center"><div className="project-name">{t.project} {projectNumber} <span> / {String(selected+1).padStart(2,'0')}</span></div><div className="canvas-wrap"><div className="slide" role="img" aria-label={slides[selected].name}><div className="slide-tag">AI PPT STUDIO</div><div className="slide-accent"/><h1>{slides[selected].title}</h1><p>{slides[selected].body}</p><div className="slide-footer">OPEN SOURCE / 2026</div></div></div><div className="status">{t.preview}</div></main>
      <aside className="inspector"><div className="section-title">✦ {t.properties}</div><div className="assistant-card"><div className="assistant-icon">✧</div><p>{t.assistant}</p></div><p className="footnote">{t.note}</p></aside></div>
  </div>;
}
