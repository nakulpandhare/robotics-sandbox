# Each challenge defines:
#   - id, name, description
#   - start position for the robot
#   - obstacles (walls/blocks)
#   - goal zone (x, y, w, h) — robot must reach this area
#   - time_limit: max seconds of simulation allowed
#   - par_time: the "good" time to beat (for bonus score)

CHALLENGES = {
    "open_run": {
        "id": "open_run",
        "name": "Open Run",
        "description": "No obstacles. Just get to the goal.",
        "start": {"x": 80, "y": 80},
        "goal": {"x": 460, "y": 460, "w": 80, "h": 80},
        "obstacles": [],
        "time_limit": 10.0,
        "par_time": 5.0,
    },
    "wall_gap": {
        "id": "wall_gap",
        "name": "Wall Gap",
        "description": "Navigate through the gap in the wall.",
        "start": {"x": 80, "y": 300},
        "goal": {"x": 460, "y": 260, "w": 80, "h": 80},
        "obstacles": [
            {"x": 250, "y": 0,   "w": 20, "h": 220},
            {"x": 250, "y": 340, "w": 20, "h": 260},
        ],
        "time_limit": 12.0,
        "par_time": 6.0,
    },
    "maze": {
        "id": "maze",
        "name": "The Maze",
        "description": "Find your way through the obstacles.",
        "start": {"x": 60, "y": 60},
        "goal": {"x": 460, "y": 460, "w": 80, "h": 80},
        "obstacles": [
            {"x": 150, "y": 0,   "w": 20, "h": 350},
            {"x": 280, "y": 150, "w": 20, "h": 450},
            {"x": 400, "y": 0,   "w": 20, "h": 350},
            {"x": 150, "y": 420, "w": 150, "h": 20},
        ],
        "time_limit": 20.0,
        "par_time": 12.0,
    },
}


def get_challenge(challenge_id: str) -> dict:
    if challenge_id not in CHALLENGES:
        raise ValueError(f"Unknown challenge: {challenge_id}")
    return CHALLENGES[challenge_id]


def list_challenges() -> list:
    return list(CHALLENGES.values())