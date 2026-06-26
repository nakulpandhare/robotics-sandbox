# ── Challenge data structure ──────────────────────────────────
#
# Each challenge has:
#   id:           unique string, used in DB and URLs
#   track:        1-6
#   order:        position within track
#   title:        display name
#   description:  what the student must do
#   workshop_link: connects to something they did in the Karoo workshop
#   concept:      primary Python concept taught
#   arena:        which physics arena layout to load
#   starter_code: pre-loaded in the editor
#   hints:        list of hints revealed one at a time (free → costs points)
#   goal:         what counts as "passing" (score threshold, flags, etc.)
#   points_max:   maximum score available
#   pass_threshold: minimum score to mark as complete
#   unlocks:      list of challenge ids this unlocks when passed
#   is_boss:      bool — boss levels gate the next track
#   is_team:      bool — collaborative challenge
#   tags:         concept tags shown in UI

CHALLENGES = {

    # ════════════════════════════════════════════════════════════
    # TRACK 1 — From hands to code
    # ════════════════════════════════════════════════════════════

    "1.1": {
        "id": "1.1",
        "track": 1,
        "order": 1,
        "title": "You already did this — with your hands",
        "description": (
            "The virtual robot is sitting still, just like your RC car did "
            "before you wired it. Call robot.move() to make it go forward "
            "and reach the green goal zone. That's it — one line of code."
        ),
        "workshop_link": (
            "Remember pushing the car forward on Day 1? This is how the "
            "motor actually gets that instruction — your code becomes an "
            "electrical signal."
        ),
        "concept": "Function calls and arguments",
        "arena": "open_field_near",
        "starter_code": """\
# Your robot is waiting for instructions.
# robot.move(speed, duration)
#   speed:    0.0 (stop)  →  1.0 (full speed)
#   duration: seconds to keep moving

robot.move(___, ___)  # fill in the blanks
""",
        "hints": [
            "Try robot.move(0.8, 2.0) — that means 80% speed for 2 seconds.",
            "The goal is close. You don't need much duration — try 1.5.",
            "Speed 1.0 is maximum. Start lower so you don't overshoot.",
        ],
        "goal": {"type": "reach_goal", "min_score": 60},
        "points_max": 100,
        "pass_threshold": 60,
        "unlocks": ["1.2"],
        "is_boss": False,
        "is_team": False,
        "tags": ["function call", "arguments", "robot.move()"],
        "arena":     "open_field_near",
        "goals":     [{"x": 420, "y": 240, "w": 70, "h": 70}],
        "flags":     [],
        "obstacles": [],
        "start":     {"x": 80, "y": 285, "angle": 0},
        "par_time":  4.0,
        "time_limit": 12.0,
    },

    "1.2": {
        "id": "1.2",
        "track": 1,
        "order": 2,
        "title": "The motor shaft turns",
        "description": (
            "Make the robot turn 90° right, move forward, then turn 90° "
            "left and reach the goal. Positive degrees = clockwise turn, "
            "negative = counter-clockwise."
        ),
        "workshop_link": (
            "You controlled the steering servo on your RC car. "
            "robot.turn() is exactly that servo receiving a signal — "
            "the number is how many degrees to rotate."
        ),
        "concept": "Sequencing multiple commands",
        "arena": "l_shaped_path",
        "starter_code": """\
# The goal is around a corner — you need to turn to reach it.
# robot.turn(degrees)
#   positive = clockwise (right)
#   negative = counter-clockwise (left)

robot.move(0.8, 1.5)   # move forward
robot.turn(___)         # turn right
robot.move(0.8, 1.5)   # move forward again
""",
        "hints": [
            "A right angle is 90 degrees. Try robot.turn(90).",
            "If you overshoot the goal, reduce the second move duration.",
            "Positive = right turn. Negative = left turn.",
        ],
        "goal": {"type": "reach_goal", "min_score": 60},
        "points_max": 100,
        "pass_threshold": 60,
        "unlocks": ["1.3"],
        "is_boss": False,
        "is_team": False,
        "tags": ["sequencing", "robot.turn()", "angles"],
        "arena":     "l_shaped_path",
        "goals":     [{"x": 440, "y": 380, "w": 70, "h": 70}],
        "flags":     [],
        "obstacles": [{"x": 280, "y": 0, "w": 20, "h": 260}],
        "start":     {"x": 80, "y": 180, "angle": 0},
        "par_time":  5.0,
        "time_limit": 15.0,
    },

    "1.3": {
        "id": "1.3",
        "track": 1,
        "order": 3,
        "title": "Speed is voltage",
        "description": (
            "Three goals at different distances, marked 1, 2, and 3. "
            "Reach goal 1 precisely — not too fast (overshoot) and not "
            "too slow (stop short). Then do the same for goals 2 and 3. "
            "Each goal gives partial points."
        ),
        "workshop_link": (
            "In your robot, speed was how much voltage you sent to the motor "
            "using PWM — analogWrite(pin, 0-255). Here, speed 0.0 to 1.0 "
            "maps directly to that 0-255 range."
        ),
        "concept": "Float values and precision",
        "arena": "three_targets",
        "starter_code": """\
# Three goals at different distances.
# Tune speed and duration to land on each one.
# Too fast = overshoot. Too slow = stop short.

# Goal 1 (close)
robot.move(___, ___)

# Goal 2 (medium) — need to reset position between goals
robot.move(___, ___)

# Goal 3 (far)
robot.move(___, ___)
""",
        "hints": [
            "Start with goal 1. Try speed=0.5, duration=1.0 and adjust from there.",
            "Smaller duration = shorter distance. Larger speed = more distance per second.",
            "You can use decimal values like 0.75 or 1.2 — you're not limited to whole numbers.",
        ],
        "goal": {"type": "reach_all_goals", "min_score": 70},
        "points_max": 150,
        "pass_threshold": 70,
        "unlocks": ["1.4"],
        "is_boss": False,
        "is_team": False,
        "tags": ["float values", "precision", "tuning"],
        "arena":     "three_targets",
        "goals":     [
            {"x": 155, "y": 235, "w": 50, "h": 50},
            {"x": 295, "y": 235, "w": 50, "h": 50},
            {"x": 435, "y": 235, "w": 50, "h": 50},
        ],
        "flags":     [],
        "obstacles": [],
        "start":     {"x": 60, "y": 260, "angle": 0},
        "par_time":  6.0,
        "time_limit": 18.0,
    },

    "1.4": {
        "id": "1.4",
        "track": 1,
        "order": 4,
        "title": "Don't hardcode — use a variable",
        "description": (
            "The arena is the same as 1.3 but the goal shifts position "
            "each run. If you hardcoded a speed number, your code will "
            "break. Store speed in a variable named my_speed — now you "
            "change one line and the whole program updates."
        ),
        "workshop_link": (
            "In Arduino you defined constants like #define SPEED 150 at "
            "the top of the file. That's a variable. Python's version is "
            "just: my_speed = 0.8. Same idea, different syntax."
        ),
        "concept": "Variables and naming",
        "arena": "shifting_goal",
        "starter_code": """\
# Store your speed here — change this ONE line to fix everything.
my_speed = 0.8

# Now use the variable instead of typing 0.8 everywhere.
robot.move(my_speed, 2.0)
robot.turn(90)
robot.move(my_speed, ___)  # what duration gets you to the goal?
""",
        "hints": [
            "Try changing my_speed to 0.6 — notice how all three moves update automatically.",
            "The goal is shifting, but your variable adjusts the whole program at once.",
            "Good variable names describe what they store: my_speed, turn_angle, wait_time.",
        ],
        "goal": {"type": "reach_goal", "min_score": 70},
        "points_max": 150,
        "pass_threshold": 70,
        "unlocks": ["1.5"],
        "is_boss": False,
        "is_team": False,
        "tags": ["variables", "assignment", "naming"],
        "arena":     "shifting_goal",
        "goals":     [{"x": 400, "y": 240, "w": 60, "h": 60}],
        "flags":     [],
        "obstacles": [],
        "start":     {"x": 80, "y": 270, "angle": 0},
        "par_time":  5.0,
        "time_limit": 15.0,
    },

    "1.5": {
        "id": "1.5",
        "track": 1,
        "order": 5,
        "title": "Comments are for teammates",
        "description": (
            "You'll see a working but messy program — no comments, "
            "cryptic names, magic numbers. Rewrite it with good variable "
            "names and comments so that a classmate can understand it "
            "without asking you a single question. Then pass it to another "
            "student to verify."
        ),
        "workshop_link": (
            "When you came back after lunch on Day 3 and couldn't remember "
            "which wire was which — that's exactly why comments exist. "
            "Good code explains itself."
        ),
        "concept": "Comments, naming, and readability",
        "arena": "open_field_near",
        "starter_code": """\
# CHALLENGE: This code works but is unreadable.
# Rewrite it with good names and comments.

x = 0.8
y = 90
z = 2.0

robot.move(x, z)
robot.turn(y)
robot.move(x, 1.5)
robot.turn(-y)
robot.move(x, z)
""",
        "hints": [
            "Rename x, y, z to something descriptive: speed, turn_angle, duration.",
            "Add a comment above each robot command explaining what it does.",
            "A good comment says WHY, not WHAT. 'turn right to avoid wall' > 'turn right'.",
        ],
        "goal": {"type": "reach_goal_and_has_comments", "min_score": 70},
        "points_max": 150,
        "pass_threshold": 70,
        "unlocks": ["1.6"],
        "is_boss": False,
        "is_team": False,
        "tags": ["comments", "naming", "readability"],
        "arena":     "open_field_near",
        "goals":     [{"x": 420, "y": 240, "w": 70, "h": 70}],
        "flags":     [],
        "obstacles": [],
        "start":     {"x": 80, "y": 275, "angle": 0},
        "par_time":  5.0,
        "time_limit": 15.0,
    },

    "1.6": {
        "id": "1.6",
        "track": 1,
        "order": 6,
        "title": "print() is your serial monitor",
        "description": (
            "A broken program — the robot isn't reaching the goal. "
            "Add print() statements to debug it. Watch the console output "
            "to figure out which command is producing the wrong result, "
            "then fix it."
        ),
        "workshop_link": (
            "Remember Serial.println() in the Arduino IDE? The text that "
            "appeared in the serial monitor while your robot ran? "
            "Python's print() is exactly the same thing — your program "
            "talking back to you while it runs."
        ),
        "concept": "print(), debugging, f-strings",
        "arena": "l_shaped_path",
        "starter_code": """\
# This program has a bug. Use print() to find it.
# Add print() statements between commands to see what's happening.

speed = 0.8
duration = 2.0

print("Starting...")
robot.move(speed, duration)
print(f"After first move — speed was {speed}")

robot.turn(45)           # is this the right angle?
print("After turn")

robot.move(speed, 0.5)   # is this the right duration?
print("Done — did we reach the goal?")
""",
        "hints": [
            "The turn angle looks suspicious — an L-shaped path needs a 90° turn, not 45°.",
            "Print the distance to the goal after each move: print(f'Distance: {robot.get_distance()}')",
            "Fix the turn angle first. Then fix the final duration if needed.",
        ],
        "goal": {"type": "reach_goal_and_has_print", "min_score": 70},
        "points_max": 200,
        "pass_threshold": 70,
        "unlocks": ["1.7"],
        "is_boss": False,
        "is_team": False,
        "tags": ["print()", "f-strings", "debugging"],
        "arena":     "l_shaped_path",
        "goals":     [{"x": 440, "y": 380, "w": 70, "h": 70}],
        "flags":     [],
        "obstacles": [{"x": 280, "y": 0, "w": 20, "h": 260}],
        "start":     {"x": 80, "y": 180, "angle": 0},
        "par_time":  5.0,
        "time_limit": 15.0,
    },

    "1.7": {
        "id": "1.7",
        "track": 1,
        "order": 7,
        "title": "Boss: recreate your RC car route",
        "description": (
            "You'll be shown the route your physical RC car completed "
            "during the Karoo workshop — a series of turns and straights. "
            "Recreate that exact route in the simulator using only "
            "move(), turn(), variables, and print(). Must score 80+ "
            "to unlock Track 2."
        ),
        "workshop_link": (
            "This IS the workshop robot. Same turns, same distances — "
            "now expressed as Python instead of physical movement. "
            "If you can write this, you understand what your robot was doing."
        ),
        "concept": "All Track 1 concepts combined",
        "arena": "workshop_route",
        "starter_code": """\
# Recreate the RC car route from your Karoo workshop.
# Use variables for values you'll reuse.
# Add print() to track your progress.

speed = ___          # set your speed
straight_time = ___  # how long for straight sections

print("Starting the workshop route...")

# Your code below:
""",
        "hints": [
            "Break the route into segments: each straight is one move(), each corner is one turn().",
            "Use a variable for speed so you can tune the whole route by changing one number.",
            "Add print() between each segment so you know exactly where the robot is.",
        ],
        "goal": {"type": "reach_goal", "min_score": 80},
        "points_max": 300,
        "pass_threshold": 80,
        "unlocks": ["2.1"],
        "is_boss": True,
        "is_team": False,
        "tags": ["boss level", "sequencing", "variables", "print()", "debugging"],
        "arena":     "workshop_route",
        "goals":     [{"x": 440, "y": 400, "w": 80, "h": 80}],
        "flags":     [],
        "obstacles": [
            {"x": 240, "y": 0,   "w": 20, "h": 280},
            {"x": 240, "y": 360, "w": 20, "h": 240},
            {"x": 360, "y": 120, "w": 240, "h": 20},
        ],
        "start":     {"x": 80, "y": 200, "angle": 0},
        "par_time":  8.0,
        "time_limit": 20.0,
    },

    # ════════════════════════════════════════════════════════════
    # TRACK 2 — Loops: stop repeating yourself
    # ════════════════════════════════════════════════════════════

    "2.1": {
        "id": "2.1",
        "track": 2,
        "order": 1,
        "title": "Arduino's loop() in Python",
        "description": (
            "Your current code copies the same 4 lines 4 times to draw "
            "a square. Rewrite it as a for loop — go from 16 lines to 4. "
            "A side-by-side view shows the before and after."
        ),
        "workshop_link": (
            "In Arduino, void loop() ran your code over and over forever. "
            "A for loop is the same idea — but you control exactly "
            "how many times it repeats before stopping."
        ),
        "concept": "for loop and range()",
        "arena": "square_path",
        "starter_code": """\
# BEFORE: This works but repeats itself 4 times.
# Rewrite it using a for loop.

# robot.move(1.0, 1.5)
# robot.turn(90)
# robot.move(1.0, 1.5)
# robot.turn(90)
# robot.move(1.0, 1.5)
# robot.turn(90)
# robot.move(1.0, 1.5)
# robot.turn(90)

# YOUR VERSION with a loop:
for i in range(___):   # how many sides does a square have?
    robot.move(1.0, 1.5)
    robot.turn(___)    # what angle completes a square?
""",
        "hints": [
            "A square has 4 sides. range(4) loops exactly 4 times.",
            "Each corner of a square is 90 degrees. robot.turn(90) turns right.",
            "The indented code inside the loop runs once per iteration.",
        ],
        "goal": {"type": "reach_goal_and_uses_loop", "min_score": 70},
        "points_max": 150,
        "pass_threshold": 70,
        "unlocks": ["2.2"],
        "is_boss": False,
        "is_team": False,
        "tags": ["for loop", "range()", "indentation"],
        "arena":     "square_path",
        "goals":     [{"x": 240, "y": 240, "w": 80, "h": 80}],
        "flags":     [],
        "obstacles": [],
        "start":     {"x": 120, "y": 120, "angle": 0},
        "par_time":  6.0,
        "time_limit": 18.0,
    },

    "2.2": {
        "id": "2.2",
        "track": 2,
        "order": 2,
        "title": "The loop counter is a variable too",
        "description": (
            "Collect 5 flags in a line. The loop runs 5 times. But the "
            "robot must also print which flag it's collecting — use the "
            "loop variable i to say 'Collecting flag 1', 'Collecting flag 2', etc."
        ),
        "workshop_link": (
            "Your Arduino counted pulses from the wheel encoder using a "
            "variable that increased by 1 each time. That's exactly what "
            "i does in a for loop — it goes 0, 1, 2, 3, 4 automatically."
        ),
        "concept": "Loop variable i and f-strings",
        "arena": "five_flags_line",
        "starter_code": """\
# Collect all 5 flags and print which one you're getting.
# The variable i goes: 0, 1, 2, 3, 4

for i in range(5):
    print(f"Collecting flag {i + 1}...")  # i+1 so it says 1,2,3 not 0,1,2
    robot.move(0.8, 1.2)
    robot.move(0.0, 0.1)  # brief pause at each flag
""",
        "hints": [
            "i starts at 0, so flag 1 is i+1. Flag 5 is when i=4.",
            "You can use i in the move command too: robot.move(0.8, 1.0 + i*0.1)",
            "print(f'Flag {i+1} of 5') makes the output even clearer.",
        ],
        "goal": {"type": "collect_all_flags", "min_score": 70},
        "points_max": 150,
        "pass_threshold": 70,
        "unlocks": ["2.3"],
        "is_boss": False,
        "is_team": False,
        "tags": ["for loop", "loop variable", "f-strings"],
        "arena":     "five_flags_line",
        "goals":     [{"x": 480, "y": 255, "w": 60, "h": 60}],
        "flags":     [
            {"x": 160, "y": 285, "colour": "green"},
            {"x": 240, "y": 285, "colour": "green"},
            {"x": 320, "y": 285, "colour": "green"},
            {"x": 400, "y": 285, "colour": "green"},
            {"x": 480, "y": 285, "colour": "green"},
        ],
        "obstacles": [],
        "start":     {"x": 60, "y": 285, "angle": 0},
        "par_time":  7.0,
        "time_limit": 20.0,
    },

    "2.3": {
        "id": "2.3",
        "track": 2,
        "order": 3,
        "title": "Shrinking spiral — math inside the loop",
        "description": (
            "Draw a spiral where each side is 0.2m shorter than the last. "
            "The loop counter i does the math for you: the duration "
            "shrinks each iteration. Completing the full spiral and "
            "reaching the centre scores full points."
        ),
        "workshop_link": (
            "Remember adjusting the PWM value to slow the motor gradually? "
            "You were doing math on a counter each loop — exactly this. "
            "2.0 - (i * 0.2) gets smaller every iteration."
        ),
        "concept": "Expressions and math inside loops",
        "arena": "open_large",
        "starter_code": """\
# Each side of the spiral gets shorter.
# i=0: duration=2.0, i=1: duration=1.8, i=2: duration=1.6 ...

for i in range(5):
    duration = 2.0 - (i * 0.2)           # shrinks each time
    print(f"Side {i+1}: duration={duration:.1f}s")
    robot.move(1.0, duration)
    robot.turn(90)
""",
        "hints": [
            "duration = 2.0 - (i * 0.2) means: 2.0, 1.8, 1.6, 1.4, 1.2 for i=0,1,2,3,4.",
            "The :.1f in the f-string formats the number to 1 decimal place.",
            "Try more iterations — range(8) with a smaller decrement like 0.15.",
        ],
        "goal": {"type": "reach_goal", "min_score": 70},
        "points_max": 200,
        "pass_threshold": 70,
        "unlocks": ["2.4"],
        "is_boss": False,
        "is_team": False,
        "tags": ["for loop", "math in loop", "expressions"],
        "arena":     "open_large",
        "goals":     [{"x": 240, "y": 240, "w": 80, "h": 80}],
        "flags":     [],
        "obstacles": [],
        "start":     {"x": 460, "y": 460, "angle": 180},
        "par_time":  8.0,
        "time_limit": 20.0,
    },

    "2.4": {
        "id": "2.4",
        "track": 2,
        "order": 4,
        "title": "while: keep going until something happens",
        "description": (
            "Move forward until the robot gets within 0.5m of the wall, "
            "then stop. for loops count a fixed number of times — "
            "while loops keep going until a condition becomes false. "
            "This is the first time your robot reacts to the world."
        ),
        "workshop_link": (
            "Your line-follower kept running while it detected the black "
            "line — the moment it lost the line, it stopped. That exact "
            "behaviour is a while loop. The sensor reading was the condition."
        ),
        "concept": "while loop and sensor conditions",
        "arena": "wall_approach",
        "starter_code": """\
# Keep moving until the wall is close.
# robot.get_distance() returns distance to nearest obstacle in metres.

print(f"Starting distance: {robot.get_distance():.2f}m")

while robot.get_distance() > 0.5:   # keep going while far from wall
    robot.move(0.4, 0.1)            # move a tiny bit forward
    print(f"Distance: {robot.get_distance():.2f}m")

print("Wall reached! Stopping.")
""",
        "hints": [
            "robot.get_distance() returns a float — the distance to the nearest wall.",
            "The condition robot.get_distance() > 0.5 is checked before each loop iteration.",
            "Small move steps (duration=0.1) give finer control. Larger steps might overshoot.",
        ],
        "goal": {"type": "stop_near_wall", "min_score": 70},
        "points_max": 200,
        "pass_threshold": 70,
        "unlocks": ["2.5"],
        "is_boss": False,
        "is_team": False,
        "tags": ["while loop", "sensor", "get_distance()", "conditions"],
        "arena":     "wall_approach",
        "goals":     [{"x": 380, "y": 240, "w": 60, "h": 60}],
        "flags":     [],
        "obstacles": [{"x": 460, "y": 100, "w": 20, "h": 400}],
        "start":     {"x": 80, "y": 270, "angle": 0},
        "par_time":  6.0,
        "time_limit": 15.0,
    },

    "2.5": {
        "id": "2.5",
        "track": 2,
        "order": 5,
        "title": "Nested loops: grid of checkpoints",
        "description": (
            "Visit a 3×3 grid of flags — 9 total. The outer loop handles "
            "rows, the inner loop handles columns. Two lines of loop code "
            "control 9 movements. This is how robots scan an area."
        ),
        "workshop_link": (
            "When your robot was programmed to scan an area systematically, "
            "it moved row by row and column by column — two counters, "
            "two loops. One inside the other."
        ),
        "concept": "Nested for loops",
        "arena": "grid_3x3",
        "starter_code": """\
# Visit every point in a 3x3 grid.
# Outer loop = rows (3 rows)
# Inner loop = columns (3 columns per row)

for row in range(3):
    print(f"--- Row {row + 1} ---")
    for col in range(3):
        print(f"  Visiting ({row+1}, {col+1})")
        robot.move(0.8, 1.0)   # move to next column
    # at end of row: go back to start of next row
    robot.turn(___)
    robot.move(0.8, ___)
    robot.turn(___)
""",
        "hints": [
            "After each row, you need to turn around and move to the next row (like a typewriter).",
            "The inner loop runs 3 times for every 1 time the outer loop runs.",
            "Total checkpoints = rows × columns = 3 × 3 = 9.",
        ],
        "goal": {"type": "collect_all_flags", "min_score": 70},
        "points_max": 250,
        "pass_threshold": 70,
        "unlocks": ["2.6"],
        "is_boss": False,
        "is_team": False,
        "tags": ["nested loops", "2D thinking", "scanning"],
        "arena":     "grid_3x3",
        "goals":     [{"x": 460, "y": 460, "w": 60, "h": 60}],
        "flags":     [
            {"x": 160, "y": 160, "colour": "green"},
            {"x": 300, "y": 160, "colour": "green"},
            {"x": 440, "y": 160, "colour": "green"},
            {"x": 160, "y": 300, "colour": "green"},
            {"x": 300, "y": 300, "colour": "green"},
            {"x": 440, "y": 300, "colour": "green"},
            {"x": 160, "y": 440, "colour": "green"},
            {"x": 300, "y": 440, "colour": "green"},
            {"x": 440, "y": 440, "colour": "green"},
        ],
        "obstacles": [],
        "start":     {"x": 60, "y": 60, "angle": 0},
        "par_time":  15.0,
        "time_limit": 30.0,
    },

    "2.6": {
        "id": "2.6",
        "track": 2,
        "order": 6,
        "title": "break and continue",
        "description": (
            "Loop through 10 checkpoints. Skip every even-numbered one "
            "using continue. Stop completely if you encounter a red flag "
            "using break. These are the loop controls your Arduino "
            "firmware used without you realising."
        ),
        "workshop_link": (
            "Your emergency stop button broke the motor loop immediately — "
            "that's break. Skipping a noisy sensor reading and retrying — "
            "that's continue. You used both in the workshop firmware."
        ),
        "concept": "break and continue",
        "arena": "mixed_flags_10",
        "starter_code": """\
# 10 checkpoints ahead. Skip even ones. Stop at red flags.
# robot.get_flag_colour() returns "green", "red", or None

for i in range(10):
    flag = robot.get_flag_colour()

    if flag == "red":
        print(f"Red flag at checkpoint {i+1}! Stopping.")
        ___         # stop the loop completely

    if i % 2 == 0:  # even numbers: 0, 2, 4, 6, 8
        print(f"Skipping checkpoint {i+1} (even)")
        ___         # skip this iteration, go to next

    print(f"Collecting checkpoint {i+1}")
    robot.move(0.8, 1.0)
""",
        "hints": [
            "break exits the loop entirely. continue skips to the next iteration.",
            "i % 2 == 0 is True when i is even (0, 2, 4...). i % 2 == 1 is True for odd.",
            "The break and continue keywords go on their own lines where the ___ blanks are.",
        ],
        "goal": {"type": "correct_flags_collected", "min_score": 70},
        "points_max": 250,
        "pass_threshold": 70,
        "unlocks": ["2.7"],
        "is_boss": False,
        "is_team": False,
        "tags": ["break", "continue", "loop control"],
        "arena":     "mixed_flags_10",
        "goals":     [{"x": 500, "y": 240, "w": 50, "h": 50}],
        "flags":     [
            {"x": 60,  "y": 285, "colour": "green"},
            {"x": 110, "y": 285, "colour": "green"},
            {"x": 160, "y": 285, "colour": "green"},
            {"x": 210, "y": 285, "colour": "red"},
            {"x": 260, "y": 285, "colour": "green"},
            {"x": 310, "y": 285, "colour": "green"},
            {"x": 360, "y": 285, "colour": "green"},
            {"x": 410, "y": 285, "colour": "red"},
            {"x": 460, "y": 285, "colour": "green"},
            {"x": 510, "y": 285, "colour": "green"},
        ],
        "obstacles": [],
        "start":     {"x": 30, "y": 285, "angle": 0},
        "par_time":  12.0,
        "time_limit": 25.0,
    },

    "2.7": {
        "id": "2.7",
        "track": 2,
        "order": 7,
        "title": "Boss: the maze runner",
        "description": (
            "A procedurally generated maze — different layout every attempt. "
            "The robot must navigate using for and while loops. "
            "No hardcoded paths allowed — the maze changes every run. "
            "Collect 3 flags and reach the exit. Must score 80+ to unlock Track 3."
        ),
        "workshop_link": (
            "This is your robot navigating an unknown environment — "
            "exactly what a real autonomous robot does when it explores "
            "a room it has never seen before."
        ),
        "concept": "All Track 2 concepts combined",
        "arena": "random_maze",
        "starter_code": """\
# The maze changes every run — no hardcoding allowed.
# Use loops and robot.get_distance() to navigate.

flags_collected = 0

while flags_collected < 3:
    if robot.get_distance() > 0.8:
        robot.move(0.6, 0.2)     # move forward if clear
    else:
        robot.turn(___)           # turn if wall ahead

    if robot.get_flag_colour() == "green":
        flags_collected += 1
        print(f"Flag collected! Total: {flags_collected}/3")

print("All flags collected — find the exit!")
""",
        "hints": [
            "If a wall is ahead, try turning 90° right. If still blocked, try 90° left.",
            "robot.get_distance() < 0.5 means a wall is very close — turn immediately.",
            "Use a while loop for the main navigation, with for loops for turning sequences.",
        ],
        "goal": {"type": "collect_flags_and_exit", "flags": 3, "min_score": 80},
        "points_max": 350,
        "pass_threshold": 80,
        "unlocks": ["3.1"],
        "is_boss": True,
        "is_team": False,
        "tags": ["boss level", "for loop", "while loop", "break", "sensors"],
        "arena":     "random_maze",
        "goals":     [{"x": 460, "y": 460, "w": 60, "h": 60}],
        "flags":     [
            {"x": 180, "y": 180, "colour": "green"},
            {"x": 420, "y": 180, "colour": "green"},
            {"x": 300, "y": 420, "colour": "green"},
        ],
        "obstacles": [],
        "start":     {"x": 60, "y": 60, "angle": 0},
        "par_time":  15.0,
        "time_limit": 30.0,
    },
}


# ── Helper functions ──────────────────────────────────────────

def get_challenge(challenge_id: str) -> dict:
    if challenge_id not in CHALLENGES:
        raise ValueError(f"Challenge '{challenge_id}' not found.")
    return CHALLENGES[challenge_id]


def get_track(track_number: int) -> list:
    """Return all challenges for a track, sorted by order."""
    return sorted(
        [c for c in CHALLENGES.values() if c["track"] == track_number],
        key=lambda c: c["order"]
    )


def get_all_tracks() -> dict:
    """Return all challenges grouped by track number."""
    tracks = {}
    for c in CHALLENGES.values():
        t = c["track"]
        if t not in tracks:
            tracks[t] = []
        tracks[t].append(c)
    for t in tracks:
        tracks[t].sort(key=lambda c: c["order"])
    return tracks


def get_unlocked_challenges(completed_ids: list) -> list:
    """
    Given a list of passed challenge IDs, return all
    challenge IDs the student has unlocked.
    Always includes 1.1 (the starting point).
    """
    unlocked = {"1.1"}
    for cid in completed_ids:
        if cid in CHALLENGES:
            for unlocked_id in CHALLENGES[cid]["unlocks"]:
                unlocked.add(unlocked_id)
    return list(unlocked)


def get_next_challenge(current_id: str) -> dict | None:
    """Return the next challenge in sequence, or None if at the end."""
    current = CHALLENGES.get(current_id)
    if not current:
        return None
    next_ids = current["unlocks"]
    if not next_ids:
        return None
    return CHALLENGES.get(next_ids[0])


def is_track_complete(track_number: int, completed_ids: list) -> bool:
    """Check if all challenges in a track are completed."""
    track_challenges = get_track(track_number)
    return all(c["id"] in completed_ids for c in track_challenges)


def get_boss_challenge(track_number: int) -> dict | None:
    """Return the boss challenge for a track."""
    track = get_track(track_number)
    bosses = [c for c in track if c["is_boss"]]
    return bosses[0] if bosses else None