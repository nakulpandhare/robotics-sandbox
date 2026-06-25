import math

FPS = 60


def score_run(frames: list, challenge: dict) -> dict:
    """
    Scores a simulation run against a curriculum challenge.
    Handles multiple goal types defined in curriculum.py.
    """
    goal_config   = challenge.get("goal", {})
    goal_type     = goal_config.get("type", "reach_goal")
    min_score     = goal_config.get("min_score", 60)
    points_max    = challenge.get("points_max", 100)
    pass_threshold = challenge.get("pass_threshold", 60)
    par_time      = challenge.get("par_time", 5.0)
    time_limit    = challenge.get("time_limit", 15.0)
    arena         = challenge.get("arena", "open_run")

    if goal_type in ("reach_goal", "reach_goal_and_has_comments",
                     "reach_goal_and_has_print", "reach_goal_and_uses_loop",
                     "stop_near_wall"):
        return _score_reach_goal(frames, challenge, points_max, pass_threshold)

    elif goal_type == "reach_all_goals":
        return _score_reach_goal(frames, challenge, points_max, pass_threshold)

    elif goal_type in ("collect_all_flags", "correct_flags_collected"):
        return _score_flags(frames, challenge, points_max, pass_threshold)

    elif goal_type == "collect_flags_and_exit":
        return _score_flags_and_exit(frames, challenge, points_max, pass_threshold)

    else:
        return _score_reach_goal(frames, challenge, points_max, pass_threshold)


def _find_goal_entry(frames: list, goals: list) -> int | None:
    """Return the frame index when robot first enters any goal zone."""
    for i, frame in enumerate(frames):
        for goal in goals:
            if _in_zone(frame, goal):
                return i
    return None


def _in_zone(frame: dict, zone: dict) -> bool:
    x, y = frame["x"], frame["y"]
    return (zone["x"] <= x <= zone["x"] + zone["w"] and
            zone["y"] <= y <= zone["y"] + zone["h"])


def _score_reach_goal(frames, challenge, points_max, pass_threshold):
    goals = challenge.get("goals") or [challenge.get("goal", {})]
    # Flatten nested goal config
    clean_goals = []
    for g in goals:
        if "w" in g:
            clean_goals.append(g)
    if not clean_goals:
        clean_goals = [{"x": 460, "y": 260, "w": 80, "h": 80}]

    reached_frame = _find_goal_entry(frames, clean_goals)
    time_taken    = round(len(frames) / FPS, 2)

    if reached_frame is None:
        # Partial credit based on how close they got
        min_dist = _min_distance_to_goals(frames, clean_goals)
        partial  = max(0, int(20 * (1 - min_dist / 300)))
        return {
            "passed": False, "score": partial,
            "time_taken": time_taken, "par_time": 5.0,
            "message": f"Goal not reached. Closest approach: {int(min_dist)}px away.",
            "breakdown": {"completion": 0, "time_bonus": partial, "total": partial}
        }

    time_to_goal = round(reached_frame / FPS, 2)
    par_time     = challenge.get("par_time", time_to_goal * 1.5)
    time_limit   = challenge.get("time_limit", 15.0)

    completion = int(points_max * 0.65)
    if time_to_goal <= par_time:
        time_bonus = int(points_max * 0.35)
    elif time_to_goal >= time_limit:
        time_bonus = 0
    else:
        ratio      = (time_limit - time_to_goal) / max(time_limit - par_time, 1)
        time_bonus = int(ratio * points_max * 0.35)

    total   = completion + time_bonus
    passed  = total >= pass_threshold

    if time_to_goal <= par_time:
        message = f"Perfect run! {time_to_goal}s — under par ({par_time}s) 🏆"
    elif passed:
        message = f"Goal reached in {time_to_goal}s — try to beat {par_time}s for full score"
    else:
        message = f"Reached the goal but score {total} is below the pass threshold ({pass_threshold}). Try again!"

    return {
        "passed": passed, "score": total,
        "time_taken": time_to_goal, "par_time": par_time,
        "message": message,
        "breakdown": {"completion": completion, "time_bonus": time_bonus, "total": total}
    }


def _score_flags(frames, challenge, points_max, pass_threshold):
    all_flags     = challenge.get("flags", [])
    green_flags   = [f for f in all_flags if f.get("colour") == "green"]
    total_green   = len(green_flags)
    if total_green == 0:
        return _score_reach_goal(frames, challenge, points_max, pass_threshold)

    collected_set = set()
    for frame in frames:
        for idx in frame.get("flags_collected", []):
            collected_set.add(idx)

    collected_green = sum(
        1 for i, f in enumerate(all_flags)
        if i in collected_set and f.get("colour") == "green"
    )
    collected_red = sum(
        1 for i, f in enumerate(all_flags)
        if i in collected_set and f.get("colour") == "red"
    )

    ratio    = collected_green / max(total_green, 1)
    score    = int(ratio * points_max) - (collected_red * 20)
    score    = max(0, min(points_max, score))
    passed   = score >= pass_threshold

    return {
        "passed": passed, "score": score,
        "time_taken": round(len(frames) / FPS, 2), "par_time": None,
        "message": f"Collected {collected_green}/{total_green} green flags" +
                   (f", hit {collected_red} red flag(s) (-{collected_red*20} pts)" if collected_red else "") +
                   (" 🏆" if collected_green == total_green else ""),
        "breakdown": {
            "flags_collected": collected_green,
            "flags_total":     total_green,
            "red_penalties":   collected_red * 20,
            "total":           score
        }
    }


def _score_flags_and_exit(frames, challenge, points_max, pass_threshold):
    flag_result  = _score_flags(frames, challenge, int(points_max * 0.6), 0)
    goal_result  = _score_reach_goal(frames, challenge, int(points_max * 0.4), 0)
    total        = flag_result["score"] + goal_result["score"]
    passed       = total >= pass_threshold

    return {
        "passed": passed, "score": total,
        "time_taken": goal_result["time_taken"], "par_time": None,
        "message": f"{flag_result['message']} · {'Reached exit!' if goal_result['passed'] else 'Did not reach exit.'}",
        "breakdown": {
            "flags_score": flag_result["score"],
            "exit_score":  goal_result["score"],
            "total":       total
        }
    }


def _min_distance_to_goals(frames, goals):
    min_dist = float("inf")
    for frame in frames[-30:]:  # check last 30 frames only
        for goal in goals:
            cx = goal["x"] + goal["w"] / 2
            cy = goal["y"] + goal["h"] / 2
            d  = math.sqrt((frame["x"] - cx)**2 + (frame["y"] - cy)**2)
            min_dist = min(min_dist, d)
    return min_dist if min_dist != float("inf") else 999