export type Language = 'zh' | 'en';
export const copy = {
  zh: {
    subtitle: '开源 AI 演示文稿桌面工作台', newProject: '新建项目', pages: '幻灯片',
    properties: 'AI 助手', assistant: 'AI 生成与编辑功能将在第三阶段接入',
    export: '导出 PPTX（即将推出）', project: '示例项目', pageOne: '封面',
    pageTwo: '产品愿景', slideTitle: '让演示创作更简单', slideBody: 'AI PPT Studio · 本地优先 · 自由编辑',
    slide2Title: '从灵感到演示', slide2Body: 'AI 规划内容，用户掌控设计',
    preview: '第一阶段：界面预览（元素暂不可拖动）', note: '项目目前保存在浏览器本地存储中；后续迁移到 SQLite。',
  },
  en: {
    subtitle: 'Open-source AI presentation desktop workspace', newProject: 'New project', pages: 'Slides',
    properties: 'AI assistant', assistant: 'AI generation and editing arrive in Phase 3',
    export: 'Export PPTX (coming soon)', project: 'Sample project', pageOne: 'Cover',
    pageTwo: 'Product vision', slideTitle: 'Make presentations easier', slideBody: 'AI PPT Studio · Local first · Editable',
    slide2Title: 'From ideas to slides', slide2Body: 'AI plans content. You control the design.',
    preview: 'Phase 1: UI preview (dragging not enabled yet)', note: 'Projects currently use browser localStorage; SQLite comes later.',
  },
} as const;
