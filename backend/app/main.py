from fastapi import FastAPI

app = FastAPI(title="AI PPT Studio Local Service", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-ppt-studio-backend", "version": "0.1.0"}
