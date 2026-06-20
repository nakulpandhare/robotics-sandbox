from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from robot import RobotController
from physics import run_simulation
from sandbox import run_user_code, SandboxError
from challenges import get_challenge, list_challenges
from scoring import score_run
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api", tags=["simulation"])


class RunRequest(BaseModel):
    code: str
    challenge_id: str = "open_run"


@router.get("/challenges")
def get_challenges():
    return {"challenges": list_challenges()}


@router.post("/run")
@limiter.limit("10/minute")
def run_code(request: Request, body: RunRequest):
    try:
        challenge = get_challenge(body.challenge_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    robot = RobotController()
    try:
        console_output = run_user_code(body.code, robot)
    except SandboxError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not robot.commands:
        raise HTTPException(
            status_code=400,
            detail="No robot commands found. Try robot.move(1.0, 2.0)"
        )

    try:
        frames = run_simulation(robot.commands, challenge)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

    result = score_run(frames, challenge)

    return {
        "frames": frames,
        "total_frames": len(frames),
        "obstacles": challenge["obstacles"],
        "goal": challenge["goal"],
        "start": challenge["start"],
        "console": console_output,
        "score": result,
        "challenge": challenge,
    }


@router.get("/ping")
def ping():
    return {"status": "ok"}