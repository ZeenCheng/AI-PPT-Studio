# AI PPT Studio

Open-source, local-first AI-powered presentation desktop application. 以本地优先为理念的开源 AI PPT 桌面应用。

**Status: Phase 1 scaffold.** The interface is a preview; AI generation, editable slides, PPTX export and bundled production backend are **not implemented yet**.

## Requirements / 开发环境

- Windows 10/11 x64 (recommended), Node.js 22 LTS, npm, Git.
- For Tauri: Rust stable MSVC toolchain, Visual Studio C++ Build Tools and Microsoft Edge WebView2 runtime.
- Python 3.11 or 3.12 for the standalone backend.

## Start the UI / 启动前端

```powershell
cd AI-PPT-Studio
npm install
npm run dev
```

Open `http://127.0.0.1:1420` in a browser. To start the desktop window after Rust/MSVC prerequisites:

```powershell
npm run desktop -- dev
```

## Start the backend / 启动后端

Use a **second** terminal:

```powershell
cd AI-PPT-Studioackend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Check `http://127.0.0.1:8000/health`. If Python 3.12 isn't installed, use `py -3.11` consistently instead. For PowerShell activation restrictions, call `.venv\Scripts\python.exe` directly.

## Compile the UI / 构建前端

```powershell
npm run build
```

Tauri desktop development: `npm run desktop -- dev`. Packaging the **UI shell only**: `npm run desktop -- build` after prerequisites; full bundled app distribution is scheduled for Phase 5.

## Repository map

- `desktop/`: Tauri + React front end
- `backend/`: FastAPI service
- `ppt-engine/`: future PPTX renderer
- `shared/schemas/`: presentation data contract
- `docs/`: architecture, roadmap and design decisions

## License

MIT, for the starter repository's own source. Individual dependencies, fonts, themes, models and generated assets retain their respective licenses.
