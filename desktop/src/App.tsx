
import { useState } from 'react';
import { create } from 'zustand';
import { copy, type Language } from './i18n';
import {
  createPresentation,
  type Presentation,
  type Slide,
} from './models/presentation';
import {
  saveProject,
  loadProject,
} from './services/projectStorage';

// UI state
type Store = {
  language: Language;
  selected: number;
  setLanguage: (v: Language) => void;
  select: (v: number) => void;
};

const useStudio = create<Store>((set) => ({
  language:
    localStorage.getItem('ai-ppt-language') === 'en'
      ? 'en'
      : 'zh',
  selected: 0,

  setLanguage: (language) => {
    localStorage.setItem('ai-ppt-language', language);
    set({ language });
  },

  select: (selected) => set({ selected }),
}));

// Load saved project, or create a new one
function initialProject(): Presentation {
  const saved = loadProject();

  if (saved && saved.slides.length > 0) {
    return saved;
  }

  return createPresentation('我的第一个 PPT');
}

// Get a slide's title and body
function getSlideText(slide: Slide) {
  const texts = slide.elements.filter(
    (element) => element.type === 'text'
  );

  return {
    title: texts[0]?.text ?? '',
    body: texts[1]?.text ?? '',
  };
}

export default function App() {
  const { language, setLanguage, selected, select } = useStudio();

  const [project, setProject] = useState<Presentation>(
    initialProject
  );

  const [saveStatus, setSaveStatus] = useState<
    'saved' | 'unsaved'
  >('unsaved');

  const [saveError, setSaveError] = useState('');

  const t = copy[language];
  const isZh = language === 'zh';

  const selectedIndex = Math.min(
    selected,
    project.slides.length - 1
  );

  const currentSlide = project.slides[selectedIndex];
  const currentText = getSlideText(currentSlide);

  // Create a new project
  function handleNewProject() {
    const newProject = createPresentation(
      isZh ? '未命名演示文稿' : 'Untitled Presentation'
    );

    setProject(newProject);
    select(0);
    setSaveStatus('unsaved');
    setSaveError('');
  }

  // Save project to localStorage
  function handleSave() {
    try {
      saveProject(project);
      setSaveStatus('saved');
      setSaveError('');
    } catch {
      setSaveError(
        isZh ? '保存失败，请检查本地存储。' : 'Failed to save project.'
      );
    }
  }

  // Change project name
  function updateProjectTitle(title: string) {
    setProject((previous) => ({
      ...previous,
      title,
    }));
    setSaveStatus('unsaved');
  }

  // Change the current slide's text
  function updateSlideText(
    field: 'title' | 'body',
    value: string
  ) {
    setProject((previous) => ({
      ...previous,
      slides: previous.slides.map((slide, index) => {
        if (index !== selectedIndex) {
          return slide;
        }

        let textIndex = 0;

        return {
          ...slide,
          elements: slide.elements.map((element) => {
            if (element.type !== 'text') {
              return element;
            }

            const currentIndex = textIndex++;
            const targetIndex = field === 'title' ? 0 : 1;

            if (currentIndex !== targetIndex) {
              return element;
            }

            return {
              ...element,
              text: value,
            };
          }),
        };
      }),
    }));

    setSaveStatus('unsaved');
  }

  // Add a new slide
  function handleAddSlide() {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      background: '#FFFFFF',
      elements: [
        {
          id: crypto.randomUUID(),
          type: 'text',
          x: 1,
          y: 2,
          w: 11,
          h: 1,
          text: isZh ? '新幻灯片' : 'New Slide',
        },
        {
          id: crypto.randomUUID(),
          type: 'text',
          x: 1,
          y: 3.2,
          w: 11,
          h: 0.6,
          text: isZh
            ? '点击右侧属性栏编辑内容'
            : 'Edit content in the right panel',
        },
      ],
    };

    setProject((previous) => ({
      ...previous,
      slides: [...previous.slides, newSlide],
    }));

    select(project.slides.length);
    setSaveStatus('unsaved');
  }

  const fieldStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #39455e',
    background: '#202b41',
    color: '#ffffff',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">A</span>
          <div>
            <strong>AI PPT Studio</strong>
            <small>{t.subtitle}</small>
          </div>
        </div>

        <div className="actions">
          <select
            aria-label="Language"
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as Language)
            }
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>

          <button onClick={handleNewProject}>
            {t.newProject}
          </button>

          <button onClick={handleSave}>
            {isZh ? '保存项目' : 'Save Project'}
          </button>

          <button
            className="primary"
            disabled
            title={t.export}
          >
            {t.export}
          </button>
        </div>
      </header>

      <div className="workspace">
        {/* Left sidebar */}
        <aside className="sidebar">
          <div className="section-title">
            {t.pages}
            <span>
              {String(project.slides.length).padStart(2, '0')}
            </span>
          </div>

          {project.slides.map((slide, index) => {
            const text = getSlideText(slide);

            return (
              <button
                key={slide.id}
                className={
                  'slide-thumb ' +
                  (selectedIndex === index ? 'active' : '')
                }
                onClick={() => select(index)}
              >
                <span className="thumb-number">
                  {index + 1}
                </span>

                <span className="thumb-preview">
                  <b>{text.title}</b>
                  <small>{text.body}</small>
                </span>

                <span className="thumb-label">
                  {isZh ? '幻灯片' : 'Slide'} {index + 1}
                </span>
              </button>
            );
          })}

          <button
            onClick={handleAddSlide}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '10px',
              border: '1px dashed #687899',
              borderRadius: '8px',
              background: 'transparent',
              color: '#b7c8e6',
              cursor: 'pointer',
            }}
          >
            + {isZh ? '添加幻灯片' : 'Add Slide'}
          </button>
        </aside>

        {/* Slide preview */}
        <main className="center">
          <div className="project-name">
            {project.title}
            <span>
              {' / '}
              {String(selectedIndex + 1).padStart(2, '0')}
            </span>
          </div>

          <div className="canvas-wrap">
            <div
              className="slide"
              role="img"
              aria-label={currentText.title}
            >
              <div className="slide-tag">
                AI PPT STUDIO
              </div>

              <div className="slide-accent" />

              <h1>{currentText.title}</h1>
              <p>{currentText.body}</p>

              <div className="slide-footer">
                OPEN SOURCE / 2026
              </div>
            </div>
          </div>

          <div className="status">
            {saveError ||
              (saveStatus === 'saved'
                ? isZh
                  ? '✓ 项目已保存到本地'
                  : '✓ Project saved locally'
                : isZh
                  ? '● 尚有未保存的修改'
                  : '● Unsaved changes')}
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="inspector">
          <div className="section-title">
            ✦ {t.properties}
          </div>

          <div style={{ marginTop: '20px' }}>
            <label>
              {isZh ? '项目名称' : 'Project Name'}
            </label>

            <input
              style={{ ...fieldStyle, marginTop: '8px' }}
              value={project.title}
              onChange={(e) =>
                updateProjectTitle(e.target.value)
              }
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <label>
              {isZh ? '幻灯片标题' : 'Slide Title'}
            </label>

            <input
              style={{ ...fieldStyle, marginTop: '8px' }}
              value={currentText.title}
              onChange={(e) =>
                updateSlideText('title', e.target.value)
              }
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <label>
              {isZh ? '幻灯片正文' : 'Slide Body'}
            </label>

            <textarea
              style={{
                ...fieldStyle,
                marginTop: '8px',
                minHeight: '90px',
                resize: 'vertical',
              }}
              value={currentText.body}
              onChange={(e) =>
                updateSlideText('body', e.target.value)
              }
            />
          </div>

          <div
            className="assistant-card"
            style={{ marginTop: '24px' }}
          >
            <div className="assistant-icon">✧</div>
            <p>{t.assistant}</p>
          </div>

          <p className="footnote">
            {isZh
              ? '当前使用本地存储，后续将升级为 SQLite。'
              : 'Currently using local storage. SQLite is planned.'}
          </p>
        </aside>
      </div>
    </div>
  );
}
