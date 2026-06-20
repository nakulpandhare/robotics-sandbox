def score_run(frames: list, challenge: dict) -> dict:
    """
    Evaluates a simulation run against a challenge.
    Returns a score dict with breakdown and pass/fail.
    """
    goal = challenge["goal"]
    time_limit = challenge["time_limit"]
    par_time = challenge["par_time"]
    fps = 60

    goal_x1 = goal["x"]
    goal_y1 = goal["y"]
    goal_x2 = goal["x"] + goal["w"]
    goal_y2 = goal["y"] + goal["h"]

    # Find the first frame where robot enters the goal zone
    reached_frame = None
    for i, frame in enumerate(frames):
        if goal_x1 <= frame["x"] <= goal_x2 and goal_y1 <= frame["y"] <= goal_y2:
            reached_frame = i
            break

    if reached_frame is None:
        return {
            "passed": False,
            "score": 0,
            "time_taken": round(len(frames) / fps, 2),
            "message": "Goal not reached. Get the robot into the green zone!",
            "breakdown": {
                "completion": 0,
                "time_bonus": 0,
                "total": 0,
            }
        }

    time_taken = round(reached_frame / fps, 2)

    # Base score for completing the challenge
    completion_score = 60

    # Time bonus: full 40 points if at/under par, scales down to 0 at time_limit
    if time_taken <= par_time:
        time_bonus = 40
    elif time_taken >= time_limit:
        time_bonus = 0
    else:
        ratio = (time_limit - time_taken) / (time_limit - par_time)
        time_bonus = round(ratio * 40)

    total = completion_score + time_bonus

    if time_taken <= par_time:
        message = f"Perfect run! {time_taken}s — under par ({par_time}s) 🏆"
    elif time_bonus > 20:
        message = f"Great run! {time_taken}s — try to beat {par_time}s for full score"
    else:
        message = f"Goal reached in {time_taken}s — optimise your path for more points"

    return {
        "passed": True,
        "score": total,
        "time_taken": time_taken,
        "par_time": par_time,
        "message": message,
        "breakdown": {
            "completion": completion_score,
            "time_bonus": time_bonus,
            "total": total,
        }
    }