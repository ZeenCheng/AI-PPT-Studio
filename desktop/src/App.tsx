
import { useRef, useState, type PointerEvent } from 'react';
import SlideRenderer from './components/SlideRenderer';
import { create } from 'zustand';
import { copy, type Language } from './i18n';
import {
  createPresentation,
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
  type Presentation,
  type Slide,
  type SlideElement,
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


  // Currently selected slide element
  const [selectedElementId, setSelectedElementId] =
    useState<string | null>(null);

  // Remember the starting position during dragging
  const dragRef = useRef<{
    elementId: string;
    startPointerX: number;
    startPointerY: number;
    startX: number;
    startY: number;
    slideWidth: number;
    slideHeight: number;
  } | null>(null);


  const t = copy[language];
  const isZh = language === 'zh';

  const selectedIndex = Math.min(
    selected,
    project.slides.length - 1
  );

  const currentSlide = project.slides[selectedIndex];
  const currentText = getSlideText(currentSlide);
  const selectedElement = currentSlide.elements.find(
    (element) => element.id === selectedElementId
  ) ?? null;

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


  function handlePointerDown(
    event: PointerEvent<HTMLDivElement>,
    element: SlideElement
  ) {
    if (event.button !== 0) return;

    const slideNode = event.currentTarget.closest('.slide-renderer');

    if (!(slideNode instanceof HTMLElement)) return;

    const rect = slideNode.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) return;

    event.preventDefault();
    event.stopPropagation();

    setSelectedElementId(element.id);

    dragRef.current = {
      elementId: element.id,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: element.x,
      startY: element.y,
      slideWidth: rect.width,
      slideHeight: rect.height,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(
    event: PointerEvent<HTMLDivElement>
  ) {
    const drag = dragRef.current;

    if (!drag) return;

    const deltaX =
      (event.clientX - drag.startPointerX) *
      (SLIDE_WIDTH / drag.slideWidth);

    const deltaY =
      (event.clientY - drag.startPointerY) *
      (SLIDE_HEIGHT / drag.slideHeight);

    setProject((previous) => ({
      ...previous,
      slides: previous.slides.map((slide, index) => {
        if (index !== selectedIndex) return slide;

        return {
          ...slide,
          elements: slide.elements.map((element) => {
            if (element.id !== drag.elementId) {
              return element;
            }

            return {
              ...element,
              x: Math.max(
                0,
                Math.min(
                  SLIDE_WIDTH - element.w,
                  drag.startX + deltaX
                )
              ),
              y: Math.max(
                0,
                Math.min(
                  SLIDE_HEIGHT - element.h,
                  drag.startY + deltaY
                )
              ),
            };
          }),
        };
      }),
    }));

    setSaveStatus('unsaved');
  }

  function handlePointerUp(
    event: PointerEvent<HTMLDivElement>
  ) {
    dragRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }


  function updateElementProperty(
    property: 'x' | 'y' | 'w' | 'h',
    value: number
  ) {
    if (!selectedElementId || !Number.isFinite(value)) {
      return;
    }

    setProject((previous) => ({
      ...previous,
      slides: previous.slides.map((slide, slideIndex) => {
        if (slideIndex !== selectedIndex) {
          return slide;
        }

        return {
          ...slide,
          elements: slide.elements.map((element) => {
            if (element.id !== selectedElementId) {
              return element;
            }

            const updated = {
              ...element,
              [property]: value,
            };

            // Keep dimensions positive
            updated.w = Math.max(
              0.2,
              Math.min(updated.w, SLIDE_WIDTH)
            );

            updated.h = Math.max(
              0.2,
              Math.min(updated.h, SLIDE_HEIGHT)
            );

            // Keep the entire element inside the slide
            updated.x = Math.max(
              0,
              Math.min(updated.x, SLIDE_WIDTH - updated.w)
            );

            updated.y = Math.max(
              0,
              Math.min(updated.y, SLIDE_HEIGHT - updated.h)
            );

            return updated;
          }),
        };
      }),
    }));

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
                  <SlideRenderer slide={slide} />
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
             style={{
               padding: 0,
               overflow: 'hidden',
             }}
           >
             <SlideRenderer
               slide={currentSlide}
               interactive
               selectedElementId={selectedElementId}
               onSelectElement={setSelectedElementId}
               onPointerDownElement={handlePointerDown}
               onPointerMoveElement={handlePointerMove}
               onPointerUpElement={handlePointerUp}
             />
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


          {/* Element Position and Size */}
          {selectedElement && (
            <div
              style={{
                marginTop: '24px',
                paddingTop: '18px',
                borderTop: '1px solid #39455e',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: '14px',
                }}
              >
                {isZh ? '位置与尺寸' : 'Position & Size'}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                {([
                  ['x', isZh ? 'X 位置 (英寸)' : 'X (in)'],
                  ['y', isZh ? 'Y 位置 (英寸)' : 'Y (in)'],
                  ['w', isZh ? '宽度 (英寸)' : 'Width (in)'],
                  ['h', isZh ? '高度 (英寸)' : 'Height (in)'],
                ] as const).map(([property, label]) => (
                  <label
                    key={property}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      fontSize: '12px',
                    }}
                  >
                    {label}

                    <input
                      type="number"
                      step="0.1"
                      min={property === 'w' || property === 'h' ? 0.2 : 0}
                      value={Number(selectedElement[property].toFixed(2))}
                      onChange={(event) => {
                        if (event.target.value === '') return;

                        updateElementProperty(
                          property,
                          Number(event.target.value)
                        );
                      }}
                      style={{
                        ...fieldStyle,
                        padding: '8px',
                      }}
                    />
                  </label>
                ))}
              </div>

              <p
                style={{
                  fontSize: '12px',
                  color: '#8fa4c8',
                  lineHeight: 1.5,
                  marginTop: '12px',
                }}
              >
                {isZh
                  ? '选择画布中的文字框，可在这里精确调整位置和大小。'
                  : 'Select an element to edit its position and size.'}
              </p>
            </div>
          )}


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
