class RobotController:
    def __init__(self):
        self.commands = []

    def move(self, speed: float, duration: float = 1.0):
        """Move forward. speed: -1.0 to 1.0, duration: seconds"""
        self.commands.append({
            "type": "move",
            "speed": max(-1.0, min(1.0, speed)),
            "duration": max(0.0, min(5.0, duration))
        })

    def turn(self, degrees: float):
        """Turn in place. Positive = right, negative = left."""
        self.commands.append({
            "type": "turn",
            "degrees": max(-360.0, min(360.0, degrees))
        })

    def wait(self, duration: float = 0.5):
        """Pause for duration seconds."""
        self.commands.append({
            "type": "wait",
            "duration": max(0.0, min(3.0, duration))
        })