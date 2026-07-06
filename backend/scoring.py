import math
import ast
import re

FPS = 60


# ── Code inspection helpers ───────────────────────────────────

def has_comments(code: str) -> bool:
    """Check if code has at least 2 meaningful comments (not just the starter template ones)."""
    lines = code.split("\n")
    comment_lines = [
        l.strip() for l in lines
        if l.strip().startswith("#") and len(l.strip()) > 2
    ]
    # Filter out the starter code header comments (lines starting with # Your, # robot, etc.)
    meaningful = [
        c for c in comment_lines
        if not any(c.startswith(f"# {w}") for w in [
            "Your", "robot.", "speed:", "duration:", "Get", "CHALLENGE",
            "Rewrite", "Store", "Now use", "positive", "negative"
        ])
    ]
    return len(meaningful) >= 2


def has_print_statements(code: str) -> bool:
    """Check if code contains at least 1 print() call."""
    try:
        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id == "print":
                    return True
    except SyntaxError:
        pass
    return False


def has_loop(code: str) -> bool:
    """Check if code contains a for or while loop."""
    try:
        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, (ast.For, ast.While)):
                return True
    except SyntaxError:
        pass
    return False


def has_variables(code: str) -> bool:
    """Check if code assigns at least one named variable (not just _ or i)."""
    try:
        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and target.id not in ("_", "i", "j", "k"):
                        return True
    except SyntaxError:
        pass
    return False


def has_good_variable_names(code: str) -> bool:
    """Check if variables have descriptive names (longer than 2 chars, not x/y/z)."""
    try:
        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        name = target.id
                        # Good name = not single letter, not generic, longer than 2 chars
                        if (len(name) > 2 and
                            name not in ("i", "j", "k", "x", "y", "z", "n", "val", "tmp")):
                            return True
    except SyntaxError:
        pass
    return False


def count_robot_commands(code: str) -> int:
    """Count how many robot.X() calls are in the code."""
    return len(re.findall(r'robot\.(move|turn|wait|get_distance|get_flag_colour)\(', code))


# ── Code quality bonus ────────────────────────────────────────

def code_quality_bonus(code: str, goal_type: str, points_max: int) -> tuple[int, list[str]]:
    """
    Returns (bonus_points, list_of_feedback_messages).
    Inspects code for quality beyond just reaching the goal.
    """
    bonus = 0
    feedback = []

    if goal_type == "reach_goal_and_has_comments":
        if has_comments(code):
            bonus += int(points_max * 0.2)
            feedback.append("✓ Good comments — code is readable")
        else:
            feedback.append("✗ Add at least 2 meaningful comments to earn full marks")

        if has_good_variable_names(code):
            bonus += int(points_max * 0.1)
            feedback.append("✓ Good variable names")
        else:
            feedback.append("✗ Rename x, y, z to descriptive names like 'speed', 'turn_angle'")

    elif goal_type == "reach_goal_and_has_print":
        if has_print_statements(code):
            bonus += int(points_max * 0.25)
            feedback.append("✓ print() statements found — good debugging!")
        else:
            feedback.append("✗ Add print() statements to earn full marks")

    elif goal_type == "reach_goal_and_uses_loop":
        if has_loop(code):
            bonus += int(points_max * 0.3)
            feedback.append("✓ Loop detected — great work!")
        else:
            feedback.append("✗ Rewrite using a for loop to earn full marks")

    return bonus, feedback


# ── Main scoring function ─────────────────────────────────────

def score_run(frames: list, challenge: dict, code: str = "") -> dict:
    """
    Scores a simulation run against a curriculum challenge.
    Now accepts the submitted code for code-quality checks.
    """
    goal_config    = challenge.get("goal", {})
    goal_type      = goal_config.get("type", "reach_goal")
    points_max     = challenge.get("points_max", 100)
    pass_threshold = challenge.get("pass_threshold", 60)

    # Route to the right scorer
    if goal_type in (
        "reach_goal",
        "reach_goal_and_has_comments",
        "reach_goal_and_has_print",
        "reach_goal_and_uses_loop",
        "stop_near_wall",
    ):
        result = _score_reach_goal(frames, challenge, points_max, pass_threshold)

    elif goal_type == "reach_all_goals":
        result = _score_reach_all_goals(frames, challenge, points_max, pass_threshold)

    elif goal_type in ("collect_all_flags", "correct_flags_collected"):
        result = _score_flags(frames, challenge, points_max, pass_threshold)

    elif goal_type == "collect_flags_and_exit":
        result = _score_flags_and_exit(frames, challenge, points_max, pass_threshold)

    else:
        result = _score_reach_goal(frames, challenge, points_max, pass_threshold)

    # Apply code quality checks for special goal types
    if code and goal_type in (
        "reach_goal_and_has_comments",
        "reach_goal_and_has_print",
        "reach_goal_and_uses_loop",
    ):
        result = _apply_code_quality(result, code, goal_type, points_max, pass_threshold)

    return result


def _apply_code_quality(result: dict, code: str, goal_type: str, points_max: int, pass_threshold: int) -> dict:
    """
    For special goal types, check code quality and adjust score.
    If the robot reached the goal but didn't meet the code requirement,
    cap the score and mark as not passed.
    """
    bonus, feedback = code_quality_bonus(code, goal_type, points_max)

    # Determine requirement
    meets_requirement = False
    requirement_label = ""

    if goal_type == "reach_goal_and_has_comments":
        meets_requirement = has_comments(code) and has_good_variable_names(code)
        requirement_label = "good comments and variable names"

    elif goal_type == "reach_goal_and_has_print":
        meets_requirement = has_print_statements(code)
        requirement_label = "at least one print() statement"

    elif goal_type == "reach_goal_and_uses_loop":
        meets_requirement = has_loop(code)
        requirement_label = "a for or while loop"

    # If robot reached goal but didn't meet code requirement:
    # Give partial credit but don't pass
    if result.get("passed") and not meets_requirement:
        capped_score = min(result["score"], int(pass_threshold * 0.85))
        result = {
            **result,
            "passed": False,
            "score": capped_score,
            "message": (
                f"Robot reached the goal ({result.get('score')} pts) but this challenge "
                f"requires {requirement_label}. "
                f"Add it to pass! Current score: {capped_score}/{points_max}."
            ),
            "breakdown": {
                **result.get("breakdown", {}),
                "code_quality_missing": requirement_label,
                "total": capped_score,
            },
            "code_feedback": feedback,
        }

    # If robot reached goal AND met requirement — add bonus
    elif result.get("passed") and meets_requirement:
        new_score = min(points_max, result["score"] + bonus)
        result = {
            **result,
            "score": new_score,
            "breakdown": {
                **result.get("breakdown", {}),
                "code_quality_bonus": bonus,
                "total": new_score,
            },
            "code_feedback": feedback,
        }

    # If robot didn't reach goal — still give code quality feedback
    else:
        result["code_feedback"] = feedback

    return result


# ── Individual scorers ────────────────────────────────────────

def _score_reach_goal(frames, challenge, points_max, pass_threshold):
    goals = challenge.get("goals") or []
    if not goals and challenge.get("goal", {}).get("w"):
        goals = [challenge["goal"]]
    if not goals:
        goals = [{"x": 460, "y": 260, "w": 80, "h": 80}]

    reached_frame = _find_goal_entry(frames, goals)
    time_taken    = round(len(frames) / FPS, 2)
    par_time      = challenge.get("par_time", 5.0)
    time_limit    = challenge.get("time_limit", 15.0)

    if reached_frame is None:
        min_dist = _min_distance_to_goals(frames, goals)
        partial  = max(0, int(20 * (1 - min_dist / 300)))
        return {
            "passed": False, "score": partial,
            "time_taken": time_taken, "par_time": par_time,
            "message": f"Goal not reached. Closest approach: {int(min_dist)}px away.",
            "breakdown": {"completion": 0, "time_bonus": partial, "total": partial},
            "code_feedback": [],
        }

    time_to_goal = round(reached_frame / FPS, 2)
    completion   = int(points_max * 0.65)

    if time_to_goal <= par_time:
        time_bonus = int(points_max * 0.35)
    elif time_to_goal >= time_limit:
        time_bonus = 0
    else:
        ratio      = (time_limit - time_to_goal) / max(time_limit - par_time, 1)
        time_bonus = int(ratio * points_max * 0.35)

    total  = completion + time_bonus
    passed = total >= pass_threshold

    if time_to_goal <= par_time:
        msg = f"Perfect run! {time_to_goal}s — under par ({par_time}s) 🏆"
    elif passed:
        msg = f"Goal reached in {time_to_goal}s — try to beat {par_time}s for full score"
    else:
        msg = f"Goal reached but score {total} is below pass threshold ({pass_threshold}). Try again!"

    return {
        "passed": passed, "score": total,
        "time_taken": time_to_goal, "par_time": par_time,
        "message": msg,
        "breakdown": {"completion": completion, "time_bonus": time_bonus, "total": total},
        "code_feedback": [],
    }


def _score_reach_all_goals(frames, challenge, points_max, pass_threshold):
    """Score challenges where robot must reach multiple goal zones."""
    goals = challenge.get("goals", [])
    if not goals:
        return _score_reach_goal(frames, challenge, points_max, pass_threshold)

    goals_reached = set()
    for frame in frames:
        for i, goal in enumerate(goals):
            if i not in goals_reached and _in_zone(frame, goal):
                goals_reached.add(i)

    ratio      = len(goals_reached) / len(goals)
    time_taken = round(len(frames) / FPS, 2)
    par_time   = challenge.get("par_time", 8.0)

    # Time bonus only if all goals reached
    if len(goals_reached) == len(goals) and time_taken <= par_time:
        time_bonus = int(points_max * 0.25)
    else:
        time_bonus = 0

    score  = int(ratio * points_max * 0.75) + time_bonus
    passed = score >= pass_threshold

    return {
        "passed": passed, "score": score,
        "time_taken": time_taken, "par_time": par_time,
        "message": f"Reached {len(goals_reached)}/{len(goals)} goals" +
                   (" 🏆" if len(goals_reached) == len(goals) else " — reach all goals to pass"),
        "breakdown": {
            "goals_reached": len(goals_reached),
            "goals_total": len(goals),
            "time_bonus": time_bonus,
            "total": score,
        },
        "code_feedback": [],
    }


def _score_flags(frames, challenge, points_max, pass_threshold):
    all_flags   = challenge.get("flags", [])
    green_flags = [f for f in all_flags if f.get("colour") == "green"]
    total_green = len(green_flags)

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

    ratio  = collected_green / max(total_green, 1)
    score  = int(ratio * points_max) - (collected_red * 20)
    score  = max(0, min(points_max, score))
    passed = score >= pass_threshold

    msg = f"Collected {collected_green}/{total_green} green flags"
    if collected_red:
        msg += f", hit {collected_red} red flag(s) (-{collected_red * 20} pts)"
    if collected_green == total_green:
        msg += " 🏆"

    return {
        "passed": passed, "score": score,
        "time_taken": round(len(frames) / FPS, 2), "par_time": None,
        "message": msg,
        "breakdown": {
            "flags_collected": collected_green,
            "flags_total": total_green,
            "red_penalties": collected_red * 20,
            "total": score,
        },
        "code_feedback": [],
    }


def _score_flags_and_exit(frames, challenge, points_max, pass_threshold):
    flag_result = _score_flags(frames, challenge, int(points_max * 0.6), 0)
    goal_result = _score_reach_goal(frames, challenge, int(points_max * 0.4), 0)
    total       = flag_result["score"] + goal_result["score"]
    passed      = total >= pass_threshold

    return {
        "passed": passed, "score": total,
        "time_taken": goal_result["time_taken"], "par_time": None,
        "message": f"{flag_result['message']} · {'Reached exit!' if goal_result['passed'] else 'Did not reach exit.'}",
        "breakdown": {
            "flags_score": flag_result["score"],
            "exit_score": goal_result["score"],
            "total": total,
        },
        "code_feedback": [],
    }


# ── Geometry helpers ──────────────────────────────────────────

def _find_goal_entry(frames, goals):
    for i, frame in enumerate(frames):
        for goal in goals:
            if _in_zone(frame, goal):
                return i
    return None


def _in_zone(frame, zone):
    x, y = frame["x"], frame["y"]
    return (zone["x"] <= x <= zone["x"] + zone["w"] and
            zone["y"] <= y <= zone["y"] + zone["h"])


def _min_distance_to_goals(frames, goals):
    min_dist = float("inf")
    for frame in frames[-30:]:
        for goal in goals:
            cx = goal["x"] + goal["w"] / 2
            cy = goal["y"] + goal["h"] / 2
            d  = math.sqrt((frame["x"] - cx) ** 2 + (frame["y"] - cy) ** 2)
            min_dist = min(min_dist, d)
    return min_dist if min_dist != float("inf") else 999