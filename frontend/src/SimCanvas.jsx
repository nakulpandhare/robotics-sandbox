import { useEffect, useRef } from "react";

const SIZE  = 360;
const SCALE = SIZE / 600;

export default function SimCanvas({ frames, obstacles, goal, goals, flags, start, robotEmoji = "🤖" }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  const allGoals = goals?.length ? goals : (goal && goal.w ? [goal] : []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    if (animRef.current) cancelAnimationFrame(animRef.current);

    if (!frames || frames.length === 0) {
      drawEmpty(ctx, obstacles, allGoals, flags, start);
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
      drawScene(ctx, frame, trail.slice(0, Math.floor(frameIndex / trailStep) + 1), obstacles, allGoals, flags, start, robotEmoji);
      frameIndex += playStep;
      if (frameIndex < frames.length) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        drawScene(ctx, frames[frames.length - 1], trail, obstacles, allGoals, flags, start, robotEmoji);
      }
    }
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [frames, obstacles, allGoals, flags, robotEmoji]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      style={{
        border: "1px solid #e8e4dc",
        borderRadius: 10, display: "block",
        background: "#fafaf8"
      }}
    />
  );
}

function drawEmpty(ctx, obstacles, goals, flags, start) {
  ctx.fillStyle = "#fafaf8";
  ctx.fillRect(0, 0, SIZE, SIZE);
  drawGrid(ctx);
  drawObstacles(ctx, obstacles);
  goals?.forEach(g => drawGoal(ctx, g));
  flags?.forEach(f => drawFlag(ctx, f));
  if (start) drawStart(ctx, start);
  if (!goals?.length) {
    ctx.fillStyle = "#d1d5db";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Write code and click Run", SIZE / 2, SIZE / 2);
  }
}

function drawScene(ctx, frame, trail, obstacles, goals, flags, start, robotEmoji) {
  ctx.fillStyle = "#fafaf8";
  ctx.fillRect(0, 0, SIZE, SIZE);
  drawGrid(ctx);
  drawObstacles(ctx, obstacles);
  goals?.forEach(g => drawGoal(ctx, g));
  flags?.forEach(f => drawFlag(ctx, f));
  if (start) drawStart(ctx, start);
  if (trail?.length > 1) drawTrail(ctx, trail);
  if (frame) drawRobot(ctx, frame, robotEmoji);
}

function drawGrid(ctx) {
  ctx.strokeStyle = "#f0ece4";
  ctx.lineWidth = 0.5;
  for (let i = 40; i < SIZE; i += 40) {
    ctx.beginPath(); ctx.moveTo(i * SCALE * (600 / SIZE), 0); ctx.lineTo(i * SCALE * (600 / SIZE), SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * SCALE * (600 / SIZE)); ctx.lineTo(SIZE, i * SCALE * (600 / SIZE)); ctx.stroke();
  }
  ctx.strokeStyle = "#e8e4dc";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(2, 2, SIZE - 4, SIZE - 4);
}

function drawObstacles(ctx, obstacles) {
  if (!obstacles?.length) return;
  for (const obs of obstacles) {
    const x = obs.x * SCALE, y = obs.y * SCALE;
    const w = obs.w * SCALE, h = obs.h * SCALE;
    ctx.fillStyle = "#d6d3cd";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }
}

function drawGoal(ctx, goal) {
  if (!goal || !goal.w) return;
  const x = goal.x * SCALE, y = goal.y * SCALE;
  const w = goal.w * SCALE, h = goal.h * SCALE;
  ctx.fillStyle = "rgba(15, 110, 86, 0.08)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#0f6e56";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
  ctx.fillStyle = "#0f6e56";
  ctx.font = `bold ${Math.max(9, Math.floor(w / 4))}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GOAL", x + w / 2, y + h / 2);
}

function drawFlag(ctx, flag) {
  if (!flag) return;
  const x = flag.x * SCALE;
  const y = flag.y * SCALE;
  const colour = flag.colour === "red" ? "#dc2626" : "#0f6e56";
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

function drawStart(ctx, start) {
  if (!start) return;
  const x = start.x * SCALE;
  const y = start.y * SCALE;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#d97706";
  ctx.fill();
  ctx.font = "9px sans-serif";
  ctx.fillStyle = "#92400e";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("START", x + 8, y);
}

function drawTrail(ctx, trail) {
  if (trail.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(trail[0].x, trail[0].y);
  for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
  ctx.strokeStyle = "rgba(15, 110, 86, 0.25)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawRobot(ctx, frame, emoji = "🤖") {
  const x   = frame.x * SCALE;
  const y   = frame.y * SCALE;
  const rad = (frame.angle * Math.PI) / 180;
  const R   = 14;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rad);

  // Direction indicator
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(R + 4, 0);
  ctx.stroke();

  ctx.restore();

  // Draw emoji centred on position
  ctx.save();
  ctx.font = `${R * 1.6}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, x, y);
  ctx.restore();
}
