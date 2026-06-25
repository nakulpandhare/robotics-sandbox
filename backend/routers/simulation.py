from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

from robot import RobotController
from physics import run_simulation
from sandbox import run_user_code, SandboxError
from scoring import score_run
from curriculum import (
    get_challenge, get_all_tracks, get_next_challenge, CHALLENGES
)

limiter = Limiter(key_func=get_remote_address)
router  = APIRouter(prefix="/api", tags=["simulation"])


class RunRequest(BaseModel):
    code:         str
    challenge_id: str = "1.1"


@router.get("/curriculum")
def full_curriculum():
    """All tracks and challenges for the challenge select page."""
    tracks = get_all_tracks()
    # Convert to list-of-dicts format the frontend expects
    serialisable = {}
    for track_num, challenges in tracks.items():
        serialisable[track_num] = challenges
    return {"tracks": serialisable}


@router.get("/challenges")
def list_challenges():
    """Flat list of all challenges — used by the old ChallengeSelector."""
    return {"challenges": list(CHALLENGES.values())}


@router.get("/challenge/{challenge_id}")
def single_challenge(challenge_id: str):
    try:
        return get_challenge(challenge_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/run")
@limiter.limit("15/minute")
def run_code(request: Request, body: RunRequest):

    # Load challenge from curriculum
    try:
        challenge = get_challenge(body.challenge_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Sandbox execution
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

    # Physics simulation
    try:
        frames = run_simulation(robot.commands, challenge)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

    # Scoring
    result       = score_run(frames, challenge)
    next_ch      = get_next_challenge(body.challenge_id) if result["passed"] else None

    # Build arena data for frontend rendering
    arena_goals = challenge.get("goals", [])
    if not arena_goals and challenge.get("goal"):
        g = challenge["goal"]
        if "w" in g:
            arena_goals = [g]

    return {
        "frames":         frames,
        "total_frames":   len(frames),
        "obstacles":      challenge.get("obstacles", []),
        "goals":          arena_goals,
        "goal":           arena_goals[0] if arena_goals else None,
        "flags":          challenge.get("flags", []),
        "start":          challenge.get("start", {}),
        "console":        console_output,
        "score":          result,
        "challenge":      challenge,
        "next_challenge": next_ch,
    }


@router.get("/ping")
def ping():
    return {"status": "ok"}