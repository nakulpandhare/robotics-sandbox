from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from robot import RobotController
from physics import run_simulation
from sandbox import run_user_code, SandboxError
from challenges import get_challenge, list_challenges
from scoring import score_run
from slowapi import Limiter
from slowapi.util import get_remote_address
from curriculum import (
    get_challenge, get_track, get_all_tracks,
    get_unlocked_challenges, get_next_challenge,
    CHALLENGES
)

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


@router.get("/curriculum")
def full_curriculum():
    """All tracks and challenges — used to render the challenge select page."""
    return {"tracks": get_all_tracks()}


@router.get("/challenge/{challenge_id}")
def single_challenge(challenge_id: str):
    """Single challenge detail — used when a student opens a challenge."""
    try:
        return get_challenge(challenge_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/progress/{user_id}")
def user_progress(user_id: str):
    """
    Return unlocked challenges for a user.
    In production this reads from the DB — for now accepts
    a comma-separated list of completed IDs as a query param.
    """
    # temporary — will be replaced with DB lookup in the next step
    return {
        "unlocked": ["1.1"],
        "completed": [],
    }


@router.post("/run")
@limiter.limit("10/minute")
def run_code(request: Request, body: RunRequest):
    # Load challenge using the new curriculum module
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

    # Determine what the student unlocked
    next_challenge = None
    if result["passed"]:
        next_challenge = get_next_challenge(body.challenge_id)

    return {
        "frames": frames,
        "total_frames": len(frames),
        "obstacles": challenge.get("obstacles", []),
        "goal": challenge.get("goal", {}),
        "start": challenge.get("start", {}),
        "console": console_output,
        "score": result,
        "challenge": challenge,
        "next_challenge": next_challenge,
    }