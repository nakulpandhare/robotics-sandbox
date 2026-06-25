import pymunk
import math
import random

FPS = 60
ARENA_W = 600
ARENA_H = 600

# ── Arena builder ─────────────────────────────────────────────

def build_arena(space: pymunk.Space, arena_type: str) -> dict:
    """
    Builds arena walls, obstacles, goals, and flags.
    Returns arena_data dict with goals, flags, start position.
    """

    # Always add outer walls
    walls = [
        [(0, 0),        (ARENA_W, 0)],
        [(0, ARENA_H),  (ARENA_W, ARENA_H)],
        [(0, 0),        (0, ARENA_H)],
        [(ARENA_W, 0),  (ARENA_W, ARENA_H)],
    ]
    for a, b in walls:
        s = pymunk.Segment(space.static_body, a, b, 2)
        s.elasticity = 0.3
        space.add(s)

    # Default arena data
    data = {
        "obstacles": [],
        "goals":     [],
        "flags":     [],
        "start":     {"x": 80, "y": 300, "angle": 0},
    }

    if arena_type == "open_field_near":
        data["goals"]  = [{"x": 460, "y": 280, "w": 70, "h": 70}]
        data["start"]  = {"x": 80, "y": 300, "angle": 0}

    elif arena_type == "l_shaped_path":
        _add_box(space, 280, 0,   20, 260)   # vertical wall with gap
        data["goals"]  = [{"x": 440, "y": 380, "w": 70, "h": 70}]
        data["start"]  = {"x": 80, "y": 180, "angle": 0}
        data["obstacles"] = [{"x": 280, "y": 0, "w": 20, "h": 260}]

    elif arena_type == "three_targets":
        data["goals"]  = [
            {"x": 180, "y": 260, "w": 50, "h": 50},
            {"x": 320, "y": 260, "w": 50, "h": 50},
            {"x": 460, "y": 260, "w": 50, "h": 50},
        ]
        data["start"]  = {"x": 80, "y": 285, "angle": 0}

    elif arena_type == "shifting_goal":
        # Goal position shifts slightly each run
        offset = random.randint(-60, 60)
        data["goals"]  = [{"x": 420 + offset, "y": 260 + offset // 2, "w": 60, "h": 60}]
        data["start"]  = {"x": 80, "y": 285, "angle": 0}

    elif arena_type == "open_field_near":
        data["goals"]  = [{"x": 440, "y": 260, "w": 70, "h": 70}]
        data["start"]  = {"x": 80, "y": 300, "angle": 0}

    elif arena_type == "wall_approach":
        _add_box(space, 460, 100, 20, 400)   # wall to approach
        data["goals"]  = [{"x": 380, "y": 260, "w": 60, "h": 60}]
        data["start"]  = {"x": 80, "y": 300, "angle": 0}
        data["obstacles"] = [{"x": 460, "y": 100, "w": 20, "h": 400}]

    elif arena_type == "square_path":
        data["goals"]  = [{"x": 260, "y": 260, "w": 80, "h": 80}]
        data["start"]  = {"x": 120, "y": 120, "angle": 0}

    elif arena_type == "five_flags_line":
        data["flags"]  = [
            {"x": 160, "y": 285, "colour": "green"},
            {"x": 240, "y": 285, "colour": "green"},
            {"x": 320, "y": 285, "colour": "green"},
            {"x": 400, "y": 285, "colour": "green"},
            {"x": 480, "y": 285, "colour": "green"},
        ]
        data["goals"]  = [{"x": 500, "y": 260, "w": 60, "h": 60}]
        data["start"]  = {"x": 80, "y": 285, "angle": 0}

    elif arena_type == "open_large":
        data["goals"]  = [{"x": 260, "y": 260, "w": 80, "h": 80}]
        data["start"]  = {"x": 480, "y": 480, "angle": 180}

    elif arena_type == "grid_3x3":
        data["flags"]  = [
            {"x": x, "y": y, "colour": "green"}
            for y in [160, 300, 440]
            for x in [160, 300, 440]
        ]
        data["goals"]  = [{"x": 480, "y": 480, "w": 60, "h": 60}]
        data["start"]  = {"x": 80, "y": 80, "angle": 0}

    elif arena_type == "mixed_flags_10":
        flags = []
        for i in range(10):
            colour = "red" if i in [3, 7] else "green"
            flags.append({"x": 60 + i * 50, "y": 285, "colour": colour})
        data["flags"]  = flags
        data["goals"]  = [{"x": 520, "y": 260, "w": 50, "h": 50}]
        data["start"]  = {"x": 40, "y": 285, "angle": 0}

    elif arena_type == "random_maze":
        walls_list = _generate_maze(space)
        data["obstacles"] = walls_list
        data["flags"]  = [
            {"x": 180, "y": 180, "colour": "green"},
            {"x": 420, "y": 180, "colour": "green"},
            {"x": 300, "y": 420, "colour": "green"},
        ]
        data["goals"]  = [{"x": 480, "y": 480, "w": 60, "h": 60}]
        data["start"]  = {"x": 80, "y": 80, "angle": 0}

    elif arena_type == "workshop_route":
        # Classic RC car route: forward, right, forward, right, forward, right, forward
        _add_box(space, 240, 0,   20, 280)
        _add_box(space, 240, 360, 20, 240)
        _add_box(space, 360, 120, 240, 20)
        data["goals"]  = [{"x": 460, "y": 420, "w": 80, "h": 80}]
        data["start"]  = {"x": 80, "y": 200, "angle": 0}
        data["obstacles"] = [
            {"x": 240, "y": 0,   "w": 20, "h": 280},
            {"x": 240, "y": 360, "w": 20, "h": 240},
            {"x": 360, "y": 120, "w": 240, "h": 20},
        ]

    # Legacy arenas (keep backward compat with old challenges)
    elif arena_type == "open_run":
        data["goals"]  = [{"x": 460, "y": 460, "w": 80, "h": 80}]
        data["start"]  = {"x": 80, "y": 80, "angle": 0}

    elif arena_type == "wall_gap":
        _add_box(space, 250, 0,   20, 220)
        _add_box(space, 250, 340, 20, 260)
        data["goals"]  = [{"x": 460, "y": 260, "w": 80, "h": 80}]
        data["start"]  = {"x": 80, "y": 300, "angle": 0}
        data["obstacles"] = [
            {"x": 250, "y": 0,   "w": 20, "h": 220},
            {"x": 250, "y": 340, "w": 20, "h": 260},
        ]

    elif arena_type == "maze":
        data["obstacles"] = [
            {"x": 150, "y": 0,   "w": 20, "h": 350},
            {"x": 280, "y": 150, "w": 20, "h": 450},
            {"x": 400, "y": 0,   "w": 20, "h": 350},
            {"x": 150, "y": 420, "w": 150, "h": 20},
        ]
        for obs in data["obstacles"]:
            _add_box(space, obs["x"], obs["y"], obs["w"], obs["h"])
        data["goals"]  = [{"x": 460, "y": 460, "w": 80, "h": 80}]
        data["start"]  = {"x": 60, "y": 60, "angle": 0}

    else:
        # Fallback
        data["goals"]  = [{"x": 460, "y": 300, "w": 80, "h": 80}]
        data["start"]  = {"x": 80, "y": 300, "angle": 0}

    return data


def _add_box(space, x, y, w, h):
    body = pymunk.Body(body_type=pymunk.Body.STATIC)
    body.position = (x + w / 2, y + h / 2)
    shape = pymunk.Poly.create_box(body, (w, h))
    shape.elasticity = 0.3
    shape.friction = 0.8
    space.add(body, shape)


def _generate_maze(space) -> list:
    """Generate a simple random maze with guaranteed passage."""
    walls = [
        {"x": 160, "y": 80,  "w": 20, "h": 200},
        {"x": 320, "y": 200, "w": 20, "h": 200},
        {"x": 420, "y": 80,  "w": 20, "h": 160},
        {"x": 80,  "y": 360, "w": 200, "h": 20},
        {"x": 340, "y": 400, "w": 180, "h": 20},
    ]
    # Randomly remove 1-2 walls so maze is always solvable
    random.shuffle(walls)
    walls = walls[:random.randint(3, 4)]
    for w in walls:
        _add_box(space, w["x"], w["y"], w["w"], w["h"])
    return walls


# ── Simulation runner ─────────────────────────────────────────

def run_simulation(commands: list, challenge: dict) -> list:
    """
    Runs physics simulation for the given commands and challenge.
    Returns list of frames: [{x, y, angle, distance, flag_colour}, ...]
    """
    space = pymunk.Space()
    space.gravity = (0, 0)

    arena_type = challenge.get("arena", "open_run")
    arena_data = build_arena(space, arena_type)

    start = arena_data["start"]
    flags = arena_data.get("flags", [])

    # Robot body
    mass   = 1
    radius = 18
    moment = pymunk.moment_for_circle(mass, 0, radius)
    robot_body  = pymunk.Body(mass, moment)
    robot_body.position = (start["x"], start["y"])
    robot_shape = pymunk.Circle(robot_body, radius)
    robot_shape.elasticity = 0.3
    robot_shape.friction   = 0.8
    space.add(robot_body, robot_shape)

    frames    = []
    angle_deg = float(start.get("angle", 0))
    dt        = 1.0 / FPS
    collected_flags = set()

    def get_distance_at(pos, angle):
        """Cast a ray forward and return distance to nearest obstacle."""
        rad = math.radians(angle)
        dx, dy = math.cos(rad), math.sin(rad)
        for dist in [d * 10 for d in range(1, 60)]:
            tx = pos.x + dx * dist
            ty = pos.y + dy * dist
            if tx < 10 or tx > ARENA_W - 10 or ty < 10 or ty > ARENA_H - 10:
                return round(dist / 40, 2)
            for shape in space.shapes:
                if shape.body == robot_body:
                    continue
                if hasattr(shape, 'bb'):
                    bb = shape.bb
                    if bb.left <= tx <= bb.right and bb.bottom <= ty <= bb.top:
                        return round(dist / 40, 2)
        return 10.0

    def get_flag_at(pos):
        """Check if robot is on a flag."""
        for i, flag in enumerate(flags):
            if i in collected_flags:
                continue
            dx = pos.x - flag["x"]
            dy = pos.y - flag["y"]
            if math.sqrt(dx*dx + dy*dy) < 28:
                collected_flags.add(i)
                return flag["colour"]
        return None

    def snapshot():
        pos = robot_body.position
        frames.append({
            "x":           round(pos.x, 2),
            "y":           round(pos.y, 2),
            "angle":       round(angle_deg, 2),
            "distance":    get_distance_at(pos, angle_deg),
            "flag_colour": get_flag_at(pos),
            "flags_collected": list(collected_flags),
        })

    snapshot()

    for cmd in commands:
        ctype = cmd.get("type")

        if ctype == "move":
            speed = cmd["speed"] * 130
            steps = int(cmd["duration"] * FPS)
            rad   = math.radians(angle_deg)
            robot_body.velocity = (math.cos(rad) * speed, math.sin(rad) * speed)
            for _ in range(steps):
                space.step(dt)
                snapshot()
            robot_body.velocity = (0, 0)

        elif ctype == "turn":
            angle_deg += cmd["degrees"]
            angle_deg  = angle_deg % 360
            robot_body.velocity = (0, 0)
            for _ in range(int(0.3 * FPS)):
                space.step(dt)
                snapshot()

        elif ctype == "wait":
            robot_body.velocity = (0, 0)
            for _ in range(int(cmd["duration"] * FPS)):
                space.step(dt)
                snapshot()

    return frames