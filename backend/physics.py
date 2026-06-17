import Box2D
from Box2D import b2World, b2Vec2
import math

PIXELS_PER_METER = 40  # 1 meter = 40 canvas pixels
FPS = 60
ARENA_W = 15  # meters wide
ARENA_H = 15  # meters tall

def run_simulation(commands: list) -> list:
    """
    Takes a list of robot commands, runs them through Box2D,
    and returns a list of frames: [{x, y, angle}, ...]
    """
    world = b2World(gravity=(0, 0), doSleep=True)

    # Create arena walls (static bodies)
    def make_wall(cx, cy, hw, hh):
        body = world.CreateStaticBody(position=(cx, cy))
        body.CreatePolygonFixture(box=(hw, hh))

    make_wall(ARENA_W / 2, 0, ARENA_W / 2, 0.1)         # bottom
    make_wall(ARENA_W / 2, ARENA_H, ARENA_W / 2, 0.1)   # top
    make_wall(0, ARENA_H / 2, 0.1, ARENA_H / 2)          # left
    make_wall(ARENA_W, ARENA_H / 2, 0.1, ARENA_H / 2)   # right

    # Create robot body (dynamic, circular)
    robot = world.CreateDynamicBody(position=(ARENA_W / 2, ARENA_H / 2))
    robot.CreateCircleFixture(radius=0.5, density=1.0, friction=0.3)
    robot.linearDamping = 5.0
    robot.angularDamping = 5.0

    frames = []
    angle_deg = 0.0  # track angle ourselves for simplicity

    def snapshot():
        pos = robot.position
        frames.append({
            "x": round(pos.x * PIXELS_PER_METER, 2),
            "y": round(pos.y * PIXELS_PER_METER, 2),
            "angle": round(angle_deg, 2)
        })

    snapshot()  # frame 0: starting position

    for cmd in commands:
        ctype = cmd.get("type")

        if ctype == "move":
            speed = cmd["speed"] * 3.0  # m/s max
            steps = int(cmd["duration"] * FPS)
            rad = math.radians(angle_deg)
            vx = math.cos(rad) * speed
            vy = math.sin(rad) * speed
            robot.linearVelocity = b2Vec2(vx, vy)
            for _ in range(steps):
                world.Step(1.0 / FPS, 6, 2)
                world.ClearForces()
                snapshot()

        elif ctype == "turn":
            angle_deg += cmd["degrees"]
            robot.linearVelocity = b2Vec2(0, 0)
            steps = int(0.3 * FPS)  # turning takes 0.3s
            for _ in range(steps):
                world.Step(1.0 / FPS, 6, 2)
                world.ClearForces()
                snapshot()

        elif ctype == "wait":
            robot.linearVelocity = b2Vec2(0, 0)
            steps = int(cmd["duration"] * FPS)
            for _ in range(steps):
                world.Step(1.0 / FPS, 6, 2)
                world.ClearForces()
                snapshot()

    return frames