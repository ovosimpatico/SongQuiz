import os
from pathlib import Path

from app.routes import game_routes, playlist_routes, preview_routes, song_routes, stats_routes
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Create the FastAPI app
app = FastAPI(
    title="Music Guesser API",
    description="API for the Music Guesser game",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = Path("static")
static_dir.mkdir(exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(game_routes.router)
app.include_router(song_routes.router)
app.include_router(preview_routes.router)
app.include_router(playlist_routes.router)
app.include_router(stats_routes.router)

@app.get("/")
async def root():
    """Root endpoint that returns basic API information."""
    return {
        "message": "Music Guesser API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


# Handle 404 errors
@app.exception_handler(404)
async def not_found_exception_handler(request, exc):
    return {
        "detail": "The requested resource was not found",
        "path": str(request.url)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)