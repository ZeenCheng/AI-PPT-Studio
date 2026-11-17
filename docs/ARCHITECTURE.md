# Architecture / 架构

## Contract-first design

AI provider -> validated Presentation JSON -> Editor state -> PPTX renderer.
Never let language models write arbitrary PPTX or executable code directly.

## Units

Slide dimensions and element geometry use inches. Default 16:9 canvas: 13.333 x 7.5 inches. The editor converts inches to pixels for preview; the PPTX engine uses inches directly.

## Runtime phases

- Phase 1: Tauri + React shell and standalone FastAPI health endpoint.
- Phase 2: local project model, element editing, history and PPTX output.
- Phase 3: OpenAI/Ollama providers and structured AI generation.
- Phase 4: import, templates, assets, validation and quality checks.
- Phase 5: Windows packaging with bundled backend/renderer and persistence.

## Security

No user key embedded in the UI build. Local service binds to 127.0.0.1 only; introduce per-launch auth before connecting real desktop IPC. Never expose an unauthenticated backend on 0.0.0.0. Persist secrets via OS keychain in a future phase; never save them inside deck JSON.

## Packaging note

This starter does NOT bundle the Python backend or PPT renderer into the Tauri installer yet. These are explicit Phase 5 tasks. The UI is an interactive preview, not an editor or PPTX exporter yet.
