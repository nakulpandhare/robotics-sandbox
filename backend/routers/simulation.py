from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from robot import RobotController
from physics import run_simulation

router = APIRouter(prefix="/api", tags=["simulation"])

class RunRequest(BaseModel):
    code: str

@router.post("/run")
def run_code(request: RunRequest):
    if len(request.code) > 2000:
        raise HTTPException(400, "Code too long (max 2000 chars)")

    robot = RobotController()

    # Safe execution: only expose the robot object
    safe_globals = {"__builtins__": {}}
    safe_locals = {"robot": robot}

    try:
        exec(request.code, safe_globals, safe_locals)
    except Exception as e:
        raise HTTPException(400, f"Code error: {str(e)}")

    if len(robot.commands) > 50:
        raise HTTPException(400, "Too many commands (max 50)")

    frames = run_simulation(robot.commands)
    return {"frames": frames, "total_frames": len(frames)}