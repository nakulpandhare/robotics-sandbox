import { useEffect, useRef } from "react";

const SIZE  = 360;
const SCALE = SIZE / 600;

export default function SimCanvas({
  frames, obstacles, goal, goals, flags, start,
  robotEmoji = "🤖", isDark = false
}) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  const allGoals = goals?.length ? goals : (goal?.w ? [goal] : []);

  // Theme-aware colour palette
  const P = isDark ? {
    bg:        "#161614",
    grid:      "#1f1f1d",
    border:    "#2a2a28",
    obstacle:  "#2a2a28",
    obsBorder: "#3a3a38",
    goal:      "rgba(16,185,129,0.12)",
    goalBorder:"#10b981",
    goalText:  "#10b981",
    flag_g:    "#10b981",
    flag_r:    "#f87171",
    start:     "#f59e0b",
    startText: "#fcd34d",
    trail:     "rgba(16,185,129,0.2)",
    emptyText: "#4b5563",
  } : {
    bg:        "#fafaf8",
    grid:      "#f0ece4",
    border:    "#e8e4dc",
    obstacle:  "#d6d3cd",
    obsBorder: "#9ca3af",
    goal:      "rgba(15,110,86,0.08)",
    goalBorder:"#0f6e56",
    goalText:  "#0f6e56",
    flag_g:    "#0f6e56",
    flag_r:    "#dc2626",
    start:     "#d97706",
    startText: "#92400e",
    trail:     "rgba(15,110,86,0.2)",
    emptyText: "#d1d5db",
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    if (animRef.current) cancelAnimationFrame(animRef.current);

    if (!frames || frames.length === 0) {
      drawEmpty(ctx, obstacles, allGoals, flags, start, robotEmoji, P);
      return;
    }

    const trailStep = Math.max(1, Math.floor(frames.length / 300));
    const trail = frames
      .filter((_, i) => i % trailStep === 0)
      .map(f => ({ x: f.x * SCALE, y: f.y * SCALE }));

    let frameIndex = 0;
    const playStep = Math.max(1, Math.floor(frames.length / 180));

    function animate() {
      const frame = frames[frameIndex];
      drawScene(ctx, frame, trail.slice(0, Math.floor(frameIndex / trailStep) + 1), obstacles, allGoals, flags, start, robotEmoji, P);
      frameIndex += playStep;
      if (frameIndex < frames.length) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        drawScene(ctx, frames[frames.length - 1], trail, obstacles, allGoals, flags, start, robotEmoji, P);
      }
    }
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [frames, obstacles, allGoals, flags, robotEmoji, isDark]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      style={{
        border: "1px solid var(--canvas-border)",
        borderRadius: 10, display: "block",
        background: P.bg
      }}
    />
  );
}

function drawEmpty(ctx, obstacles, goals, flags, start, emoji, P) {
  ctx.fillStyle = P.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  drawGrid(ctx, P);
  drawObstacles(ctx, obstacles, P);
  goals?.forEach(g => drawGoal(ctx, g, P));
  flags?.forEach(f => drawFlag(ctx, f, P));
  if (start) drawStart(ctx, start, P);
  if (!goals?.length && !obstacles?.length) {
    ctx.fillStyle = P.emptyText;
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Write code and click Run", SIZE / 2, SIZE / 2);
  }
}

function drawScene(ctx, frame, trail, obstacles, goals, flags, start, emoji, P) {
  ctx.fillStyle = P.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  drawGrid(ctx, P);
  drawObstacles(ctx, obstacles, P);
  goals?.forEach(g => drawGoal(ctx, g, P));
  flags?.forEach(f => drawFlag(ctx, f, P));
  if (start) drawStart(ctx, start, P);
  if (trail?.length > 1) drawTrail(ctx, trail, P);
  if (frame) drawRobot(ctx, frame, emoji, P);
}

function drawGrid(ctx, P) {
  ctx.strokeStyle = P.grid;
  ctx.lineWidth = 0.5;
  const step = SIZE / 6;
  for (let i = step; i < SIZE; i += step) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(SIZE, i); ctx.stroke();
  }
  ctx.strokeStyle = P.border;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(2, 2, SIZE - 4, SIZE - 4);
}

function drawObstacles(ctx, obstacles, P) {
  if (!obstacles?.length) return;
  for (const obs of obstacles) {
    const x = obs.x * SCALE, y = obs.y * SCALE;
    const w = obs.w * SCALE, h = obs.h * SCALE;
    ctx.fillStyle = P.obstacle;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = P.obsBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }
}

function drawGoal(ctx, goal, P) {
  if (!goal?.w) return;
  const x = goal.x * SCALE, y = goal.y * SCALE;
  const w = goal.w * SCALE, h = goal.h * SCALE;
  ctx.fillStyle = P.goal;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = P.goalBorder;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
  ctx.fillStyle = P.goalText;
  ctx.font = `bold ${Math.max(9, Math.floor(w / 4))}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GOAL", x + w / 2, y + h / 2);
}

function drawFlag(ctx, flag, P) {
  if (!flag) return;
  const x = flag.x * SCALE;
  const y = flag.y * SCALE;
  const colour = flag.colour === "red" ? P.flag_r : P.flag_g;
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x, y + 10); ctx.lineTo(x, y - 10); ctx.stroke();
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x + 8, y - 5);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();
}

function drawStart(ctx, start, P) {
  if (!start) return;
  const x = start.x * SCALE;
  const y = start.y * SCALE;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = P.start;
  ctx.fill();
  ctx.font = "9px sans-serif";
  ctx.fillStyle = P.startText;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("START", x + 8, y);
}

function drawTrail(ctx, trail, P) {
  if (trail.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(trail[0].x, trail[0].y);
  for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
  ctx.strokeStyle = P.trail;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawRobot(ctx, frame, emoji, P) {
  const x   = frame.x * SCALE;
  const y   = frame.y * SCALE;
  const rad = (frame.angle * Math.PI) / 180;
  const R   = 14;

  // Direction arrow
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rad);
  ctx.strokeStyle = P.start;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(R + 4, 0);
  ctx.stroke();
  ctx.restore();

  // Emoji
  ctx.save();
  ctx.font = `${R * 1.6}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, x, y);
  ctx.restore();
}
