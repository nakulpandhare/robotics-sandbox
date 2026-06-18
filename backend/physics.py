import pymunk
import math

FPS = 60
ARENA_W = 600
ARENA_H = 600


def run_simulation(commands: list, obstacles: list = None) -> dict:
    """
    Runs the physics simulation and returns frames + obstacle data
    so the frontend can draw them.
    """
    space = pymunk.Space()
    space.gravity = (0, 0)

    # Arena walls
    walls = [
        [(0, 0), (ARENA_W, 0)],
        [(0, ARENA_H), (ARENA_W, ARENA_H)],
        [(0, 0), (0, ARENA_H)],
        [(ARENA_W, 0), (ARENA_W, ARENA_H)],
    ]
    for a, b in walls:
        shape = pymunk.Segment(space.static_body, a, b, 2)
        shape.elasticity = 0.4
        shape.friction = 0.8
        space.add(shape)

    # Default obstacle layout if none provided
    if obstacles is None:
        obstacles = [
            {"x": 200, "y": 150, "w": 80, "h": 20},
            {"x": 350, "y": 280, "w": 20, "h": 100},
            {"x": 150, "y": 380, "w": 100, "h": 20},
            {"x": 420, "y": 150, "w": 20, "h": 80},
        ]

    # Add obstacles as static boxes
    for obs in obstacles:
        cx = obs["x"] + obs["w"] / 2
        cy = obs["y"] + obs["h"] / 2
        hw = obs["w"] / 2
        hh = obs["h"] / 2
        body = pymunk.Body(body_type=pymunk.Body.STATIC)
        body.position = (cx, cy)
        shape = pymunk.Poly.create_box(body, (obs["w"], obs["h"]))
        shape.elasticity = 0.4
        shape.friction = 0.8
        space.add(body, shape)

    # Robot
    mass = 1
    radius = 18
    moment = pymunk.moment_for_circle(mass, 0, radius)
    robot_body = pymunk.Body(mass, moment)
    robot_body.position = (80, 80)   # start top-left corner
    robot_shape = pymunk.Circle(robot_body, radius)
    robot_shape.elasticity = 0.4
    robot_shape.friction = 0.8
    space.add(robot_body, robot_shape)

    frames = []
    angle_deg = 0.0
    dt = 1.0 / FPS

    def snapshot():
        frames.append({
            "x": round(robot_body.position.x, 2),
            "y": round(robot_body.position.y, 2),
            "angle": round(angle_deg, 2)
        })

    snapshot()

    for cmd in commands:
        ctype = cmd.get("type")

        if ctype == "move":
            speed = cmd["speed"] * 130
            steps = int(cmd["duration"] * FPS)
            rad = math.radians(angle_deg)
            robot_body.velocity = (math.cos(rad) * speed, math.sin(rad) * speed)
            for _ in range(steps):
                space.step(dt)
                snapshot()
            robot_body.velocity = (0, 0)

        elif ctype == "turn":
            angle_deg += cmd["degrees"]
            robot_body.velocity = (0, 0)
            steps = int(0.3 * FPS)
            for _ in range(steps):
                space.step(dt)
                snapshot()

        elif ctype == "wait":
            robot_body.velocity = (0, 0)
            steps = int(cmd["duration"] * FPS)
            for _ in range(steps):
                space.step(dt)
                snapshot()

    return {
        "frames": frames,
        "obstacles": obstacles,
        "start": {"x": 70, "y": 80}
    }