MAX_COMMANDS = 50

class RobotController:
    def __init__(self):
        self.commands = []

    def _add(self, cmd: dict):
        if len(self.commands) >= MAX_COMMANDS:
            raise Exception(f"Command limit reached ({MAX_COMMANDS} max). Simplify your code.")
        self.commands.append(cmd)

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