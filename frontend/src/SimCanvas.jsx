import { useEffect, useRef } from "react";

const SIZE = 520;

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
    const step = Math.max(1, Math.floor(frames.length / 180));

    function animate() {
      drawFrame(ctx, frames[frameIndex]);
      frameIndex += step;
      if (frameIndex < frames.length) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // Draw final frame cleanly
        drawFrame(ctx, frames[frames.length - 1]);
      }
    }
    animate();

    return () => cancelAnimationFrame(animRef.current);
  }, [frames]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      style={{
        border: "1px solid #222",
        borderRadius: 10,
        display: "block"
      }}
    />
  );
}

function drawEmpty(ctx) {
  ctx.fillStyle = "#161616";
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = "#2a2a2a";
  ctx.font = "13px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Write code and click ▶ Run", SIZE / 2, SIZE / 2);
}

function drawFrame(ctx, frame) {
  // Background
  ctx.fillStyle = "#161616";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Grid
  ctx.strokeStyle = "#1c1c1c";
  ctx.lineWidth = 0.5;
  for (let i = 40; i < SIZE; i += 40) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(SIZE, i); ctx.stroke();
  }

  // Arena border
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 2;
  ctx.strokeRect(3, 3, SIZE - 6, SIZE - 6);

  if (!frame) return;

  const { x, y, angle } = frame;
  const rad = (angle * Math.PI) / 180;
  const R = 18;

  // Draw trail dot (subtle)
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#14532d";
  ctx.fill();

  // Robot body
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rad);

  // Glow effect
  ctx.shadowColor = "#22c55e";
  ctx.shadowBlur = 12;

  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fillStyle = "#22c55e";
  ctx.fill();
  ctx.strokeStyle = "#16a34a";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Direction nose
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(R - 2, 0);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.restore();
}