from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from routers import simulation

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Robotics Sandbox API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5173/robotics-sandbox",
        "https://nakulpandhare.github.io",
        "https://nakulpandhare.github.io/robotics-sandbox",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulation.router)

@app.get("/")
def root():
    return {"status": "ok", "version": "2.0"}