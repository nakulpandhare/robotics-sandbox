from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from robot import RobotController
from physics import run_simulation
from sandbox import run_user_code, SandboxError

router = APIRouter(prefix="/api", tags=["simulation"])


class RunRequest(BaseModel):
    code: str


class RunResponse(BaseModel):
    frames: list
    total_frames: int
    console: list[str]  # print() output from user code


@router.post("/run", response_model=RunResponse)
def run_code(request: RunRequest):
    robot = RobotController()

    # Run code in sandbox
    try:
        console_output = run_user_code(request.code, robot)
    except SandboxError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Nothing to simulate
    if not robot.commands:
        raise HTTPException(
            status_code=400,
            detail="Your code ran but didn't call any robot commands. Try robot.move(1.0, 2.0)"
        )

    # Run physics simulation
    try:
        frames = run_simulation(robot.commands)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

    return RunResponse(
        frames=frames,
        total_frames=len(frames),
        console=console_output
    )


@router.get("/ping")
def ping():
    return {"status": "ok"}