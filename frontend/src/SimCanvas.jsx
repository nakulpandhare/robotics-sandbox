import { useEffect, useRef } from "react";

const SIZE = 520;
const SCALE = SIZE / 600; // our arena is 600px internally

export default function SimCanvas({ frames, obstacles, goal, start }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (animRef.current) cancelAnimationFrame(animRef.current);

    if (!frames || frames.length === 0) {
      drawEmpty(ctx, obstacles, goal);
      return;
    }

    // Build trail: sample every Nth frame so we don't store 10k points
    const trailStep = Math.max(1, Math.floor(frames.length / 300));
    const trail = frames
      .filter((_, i) => i % trailStep === 0)
      .map(f => ({ x: f.x * SCALE, y: f.y * SCALE }));

    let frameIndex = 0;
    const playStep = Math.max(1, Math.floor(frames.length / 180));

    function animate() {
      const frame = frames[frameIndex];
      drawScene(ctx, frame, trail.slice(0, Math.floor(frameIndex / trailStep)), obstacles, goal, start);
      frameIndex += playStep;
      if (frameIndex < frames.length) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        drawScene(ctx, frames[frames.length - 1], trail, obstacles, goal, start);
      }
    }

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [frames, obstacles, goal]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      style={{ border: "1px solid #222", borderRadius: 10, display: "block" }}
    />
  );
}

function drawEmpty(ctx, obstacles, goal) {
  ctx.fillStyle = "#161616";
  ctx.fillRect(0, 0, SIZE, SIZE);
  drawGrid(ctx);
  drawObstacles(ctx, obstacles);
  if (goal) drawGoal(ctx, goal);
  ctx.fillStyle = "#2a2a2a";
  ctx.font = "13px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Write code and click ▶ Run", SIZE / 2, SIZE / 2);
}

function drawScene(ctx, frame, trail, obstacles, goal, start) {
  ctx.fillStyle = "#161616";
  ctx.fillRect(0, 0, SIZE, SIZE);
  drawGrid(ctx);
  drawObstacles(ctx, obstacles);
  if (goal) drawGoal(ctx, goal);
  if (start) drawStart(ctx, start);
  if (trail && trail.length > 1) drawTrail(ctx, trail);
  if (frame) drawRobot(ctx, frame);
}

function drawGrid(ctx) {
  ctx.strokeStyle = "#1c1c1c";
  ctx.lineWidth = 0.5;
  for (let i = 40; i < SIZE; i += 40) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(SIZE, i); ctx.stroke();
  }
  ctx.strokeStyle = "#252525";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(2, 2, SIZE - 4, SIZE - 4);
}

function drawObstacles(ctx, obstacles) {
  if (!obstacles) return;
  for (const obs of obstacles) {
    const x = obs.x * SCALE;
    const y = obs.y * SCALE;
    const w = obs.w * SCALE;
    const h = obs.h * SCALE;

    // Fill
    ctx.fillStyle = "#1e3a2f";
    ctx.fillRect(x, y, w, h);

    // Border
    ctx.strokeStyle = "#22c55e44";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // Hatching so they look solid
    ctx.strokeStyle = "#16532d33";
    ctx.lineWidth = 0.5;
    for (let i = -h; i < w + h; i += 10) {
      ctx.beginPath();
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i + h, y + h);
      ctx.stroke();
    }
  }
}

function drawStart(ctx, start) {
  const x = start.x * SCALE;
  const y = start.y * SCALE;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#854d0e";
  ctx.fill();
  ctx.font = "10px monospace";
  ctx.fillStyle = "#a16207";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("START", x + 10, y);
}

function drawTrail(ctx, trail) {
  if (trail.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(trail[0].x, trail[0].y);
  for (let i = 1; i < trail.length; i++) {
    ctx.lineTo(trail[i].x, trail[i].y);
  }
  ctx.strokeStyle = "#14532d";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawRobot(ctx, frame) {
  const x = frame.x * SCALE;
  const y = frame.y * SCALE;
  const rad = (frame.angle * Math.PI) / 180;
  const R = 14;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rad);

  // Glow
  ctx.shadowColor = "#22c55e";
  ctx.shadowBlur = 14;

  // Body
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fillStyle = "#22c55e";
  ctx.fill();
  ctx.strokeStyle = "#16a34a";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Nose
  ctx.beginPath();
  ctx.moveTo(2, 0);
  ctx.lineTo(R - 1, 0);
  ctx.strokeStyle = "#052e16";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.restore();
}

function drawGoal(ctx, goal) {
  const x = goal.x * SCALE;
  const y = goal.y * SCALE;
  const w = goal.w * SCALE;
  const h = goal.h * SCALE;

  // Pulsing green fill
  ctx.fillStyle = "#14532d55";
  ctx.fillRect(x, y, w, h);

  // Border
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 3]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);

  // Label
  ctx.fillStyle = "#22c55e";
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GOAL", x + w / 2, y + h / 2);
}