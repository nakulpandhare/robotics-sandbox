from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import simulation

app = FastAPI(title="Robotics Sandbox API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulation.router)

@app.get("/")
def root():
    return {"status": "ok"}