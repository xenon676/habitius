from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import inventory, users, habits, dailies, todos, auth
from . import cron
from .database import engine
from . import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Create the FastAPI app
app = FastAPI(
    title="Habitius API",
    description="Backend API for Habitius habit tracking application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(todos.router)
app.include_router(habits.router)
app.include_router(dailies.router)
app.include_router(inventory.router)
app.include_router(cron.router, prefix="/cron")

@app.get("/")
async def root():
    return {
        "message": "Welcome to Habitius API",
        "docs_url": "/docs",
        "endpoints": {
            "auth": "/auth",
            "users": "/users",
            "todos": "/todos",
            "habits": "/habits",
            "dailies": "/dailies",
            "inventory": "/inventory",
            "cron": "/cron"
        }
    } 