# 🤖 Robotics Sandbox

Write Python code to control a virtual robot, navigate physics-based obstacle
courses, and compete on a global leaderboard.

**[Live demo →](https://robotics-sandbox.vercel.app)**

> First load may take ~30s — the free backend spins down when idle.

## How it works

Write simple commands like `robot.move(1.0, 2.0)` and `robot.turn(90)`,
hit Run, and watch your code control a robot in a 2D physics simulation
(powered by [pymunk](http://www.pymunk.org/)). Reach the goal zone fast
for a higher score.

## Tech stack

- **Frontend**: React, Vite, Monaco Editor, HTML Canvas
- **Backend**: FastAPI, pymunk (2D physics)
- **Database/Auth**: Supabase (Postgres + GitHub OAuth)
- **Hosting**: Vercel (frontend) + Render (backend)

## Run it locally

**Backend:**
\`\`\`bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
\`\`\`

**Frontend:**
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## API reference

| Function | Description |
|---|---|
| `robot.move(speed, duration)` | Move forward/backward. speed: -1.0 to 1.0 |
| `robot.turn(degrees)` | Rotate in place. Positive = clockwise |
| `robot.wait(duration)` | Pause for `duration` seconds |