# Development roadmap

## Phase 1 · Foundation
- [x] Repository layout, MIT license, README, Git ignore
- [x] React + TypeScript + Vite application shell
- [x] Tauri 2 application configuration
- [x] Chinese/English shell translations
- [x] Python FastAPI service and /health endpoint
- [x] Draft presentation JSON schema
- [ ] Verify on clean Windows: npm install, npm run dev, npm run desktop dev
- [ ] Initialize GitHub repo and push first commit
- [ ] Connect UI to safely launched local backend (not yet done)
- [ ] Introduce SQLite persistence and .aippt projects

## Phase 2 · Editable slides
- [ ] Domain types, schema validators, inch-to-pixel mapping
- [ ] Select, drag, resize text/image/shape elements
- [ ] Undo/redo and autosave
- [ ] Export real editable PPTX and verify in PowerPoint

## Phase 3 · AI
- [ ] OpenAI and Ollama adapters, API configuration
- [ ] Outline/content/layout generation with typed JSON
- [ ] Edit one slide without affecting the rest
- [ ] Provider errors, retries, cost and progress UI

## Phase 4 · Advanced
- [ ] Templates, PDF/DOCX ingestion, image support, notes
- [ ] Layout rules and quality checker
- [ ] Visual regression and export/import tests

## Phase 5 · Distribution
- [ ] Bundle all required local binaries as Tauri sidecars
- [ ] Windows x64 NSIS installer and optional portable release
- [ ] User-data migration, updates and clean-machine tests
- [ ] GitHub Actions release workflow, security audit
