from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import BACKEND_CORS_ORIGINS

app = FastAPI(title="AI Research Assistant", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root() -> dict:
    return {
        "message": "AI Research Assistant API",
        "docs": "/docs",
        "health": "/api/health",
    }
