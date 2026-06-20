import pymunk
import math

FPS = 60
ARENA_W = 600
ARENA_H = 600


def run_simulation(commands: list, challenge: dict) -> dict:
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

    # Obstacles from challenge
    for obs in challenge.get("obstacles", []):
        body = pymunk.Body(body_type=pymunk.Body.STATIC)
        body.position = (obs["x"] + obs["w"] / 2, obs["y"] + obs["h"] / 2)
        shape = pymunk.Poly.create_box(body, (obs["w"], obs["h"]))
        shape.elasticity = 0.4
        shape.friction = 0.8
        space.add(body, shape)

    # Robot — spawn at challenge start position
    start = challenge["start"]
    mass = 1
    radius = 18
    moment = pymunk.moment_for_circle(mass, 0, radius)
    robot_body = pymunk.Body(mass, moment)
    robot_body.position = (start["x"], start["y"])
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
            robot_body.velocity = (
                math.cos(rad) * speed,
                math.sin(rad) * speed
            )
            for _ in range(steps):
                space.step(dt)
                snapshot()
            robot_body.velocity = (0, 0)

        elif ctype == "turn":
            angle_deg += cmd["degrees"]
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