from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from robot import RobotController
from physics import run_simulation
from sandbox import run_user_code, SandboxError

router = APIRouter(prefix="/api", tags=["simulation"])


class RunRequest(BaseModel):
    code: str


@router.post("/run")
def run_code(request: RunRequest):
    robot = RobotController()

    try:
        console_output = run_user_code(request.code, robot)
    except SandboxError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not robot.commands:
        raise HTTPException(
            status_code=400,
            detail="No robot commands found. Try robot.move(1.0, 2.0)"
        )

    try:
        result = run_simulation(robot.commands)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

    return {
        "frames": result["frames"],
        "obstacles": result["obstacles"],
        "start": result["start"],
        "total_frames": len(result["frames"]),
        "console": console_output
    }


@router.get("/ping")
def ping():
    return {"status": "ok"}