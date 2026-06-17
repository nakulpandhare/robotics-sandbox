import { useEffect, useRef } from "react";

const CANVAS_SIZE = 560;
const ARENA_PX = 560;

export default function SimCanvas({ frames }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (animRef.current) cancelAnimationFrame(animRef.current);

    if (!frames || frames.length === 0) {
      drawEmpty(ctx);
      return;
    }

    let frameIndex = 0;
    // Play at 60fps but skip frames to finish in ~3 seconds max
    const step = Math.max(1, Math.floor(frames.length / 180));

    function animate() {
      drawFrame(ctx, frames[frameIndex]);
      frameIndex += step;
      if (frameIndex < frames.length) {
        animRef.current = requestAnimationFrame(animate);
      }
    }
    animate();

    return () => cancelAnimationFrame(animRef.current);
  }, [frames]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      style={{ border: "1px solid #333", borderRadius: 8 }}
    />
  );
}

function drawEmpty(ctx) {
  ctx.fillStyle = "#161616";
  ctx.fillRect(0, 0, 560, 560);
  ctx.fillStyle = "#333";
  ctx.font = "14px monospace";
  ctx.textAlign = "center";
  ctx.fillText("Write code and click Run", 280, 280);
}

function drawFrame(ctx, frame) {
  // Background
  ctx.fillStyle = "#161616";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Arena border
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, ARENA_PX - 8, ARENA_PX - 8);

  // Grid lines
  ctx.strokeStyle = "#1e1e1e";
  ctx.lineWidth = 0.5;
  for (let i = 40; i < ARENA_PX; i += 40) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, ARENA_PX); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(ARENA_PX, i); ctx.stroke();
  }

  if (!frame) return;

  const { x, y, angle } = frame;
  const rad = (angle * Math.PI) / 180;
  const R = 18; // robot radius in pixels

  // Robot body
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rad);

  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fillStyle = "#22c55e";
  ctx.fill();
  ctx.strokeStyle = "#16a34a";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Direction indicator (nose)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(R, 0);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}