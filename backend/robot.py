MAX_COMMANDS = 50

class RobotController:
    def __init__(self):
        self.commands = []
        self._sensor_data = {}   # injected by physics engine after each step

    def _add(self, cmd: dict):
        if len(self.commands) >= MAX_COMMANDS:
            raise Exception(f"Command limit reached ({MAX_COMMANDS} max). Simplify your code.")
        self.commands.append(cmd)

    # ── Movement ──────────────────────────────────────────────

    def move(self, speed: float, duration: float = 1.0):
        """Move forward or backward.
        speed: -1.0 (full reverse) to 1.0 (full forward)
        duration: seconds (0 to 5)
        """
        if not isinstance(speed, (int, float)):
            raise Exception("move() speed must be a number")
        if not isinstance(duration, (int, float)):
            raise Exception("move() duration must be a number")
        self._add({
            "type": "move",
            "speed": max(-1.0, min(1.0, float(speed))),
            "duration": max(0.0, min(5.0, float(duration)))
        })

    def turn(self, degrees: float):
        """Turn in place.
        degrees: positive = clockwise, negative = counter-clockwise
        """
        if not isinstance(degrees, (int, float)):
            raise Exception("turn() degrees must be a number")
        self._add({
            "type": "turn",
            "degrees": max(-360.0, min(360.0, float(degrees)))
        })

    def wait(self, duration: float = 0.5):
        """Pause the robot.
        duration: seconds (0 to 3)
        """
        if not isinstance(duration, (int, float)):
            raise Exception("wait() duration must be a number")
        self._add({
            "type": "wait",
            "duration": max(0.0, min(3.0, float(duration)))
        })

    # ── Sensors ───────────────────────────────────────────────
    # These are called DURING simulation by the physics engine.
    # In sandbox mode they return pre-computed values injected
    # by the simulator before user code runs each step.

    def get_distance(self) -> float:
        """Returns distance to nearest obstacle in metres (0.0 to 10.0).
        Used in while loops: while robot.get_distance() > 0.5
        """
        return float(self._sensor_data.get("distance", 10.0))

    def get_flag_colour(self) -> str | None:
        """Returns colour of flag at current position: 'green', 'red', or None."""
        return self._sensor_data.get("flag_colour", None)

    def get_position(self) -> dict:
        """Returns current position: {'x': float, 'y': float, 'angle': float}"""
        return self._sensor_data.get("position", {"x": 300.0, "y": 300.0, "angle": 0.0})