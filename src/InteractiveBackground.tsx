import { useEffect, useRef } from "react";

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const mouse = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };

    // Offscreen canvas for blur layer
    const glowCanvas = document.createElement("canvas");
    const glowCtx = glowCanvas.getContext("2d");

    // Grain texture
    const grainCanvas = document.createElement("canvas");
    const grainCtx = grainCanvas.getContext("2d");

    const createGrain = () => {
      if (!grainCtx) return;

      const size = 220;
      grainCanvas.width = size;
      grainCanvas.height = size;

      const imageData = grainCtx.createImageData(size, size);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const v = Math.floor(Math.random() * 255);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 22;
      }

      grainCtx.putImageData(imageData, 0, 0);
    };

    createGrain();

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      glowCanvas.width = width * dpr;
      glowCanvas.height = height * dpr;
      glowCtx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      target.x = e.clientX / width;
      target.y = e.clientY / height;
    };

    window.addEventListener("mousemove", onMouseMove);

    const drawGlow = (
      x: number,
      y: number,
      radius: number,
      color: string,
      alpha: number
    ) => {
      if (!glowCtx) return;

      const g = glowCtx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, `${color}${alpha})`);
      g.addColorStop(0.35, `${color}${alpha * 0.35})`);
      g.addColorStop(0.7, `${color}${alpha * 0.12})`);
      g.addColorStop(1, `${color}0)`);

      glowCtx.fillStyle = g;
      glowCtx.fillRect(0, 0, width, height);
    };

    let rafId = 0;

    const animate = (time: number) => {
      const t = time * 0.001;

      // Smooth but responsive follow
      mouse.x += (target.x - mouse.x) * 0.09;
      mouse.y += (target.y - mouse.y) * 0.09;

      const mx = mouse.x - 0.5;
      const my = mouse.y - 0.5;

      ctx.clearRect(0, 0, width, height);

      // True black base
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      if (!glowCtx) return;
      glowCtx.clearRect(0, 0, width, height);

      // drift
      const drift1X = Math.sin(t * 0.22) * 0.05;
      const drift1Y = Math.cos(t * 0.18) * 0.05;

      const drift2X = Math.cos(t * 0.19) * 0.05;
      const drift2Y = Math.sin(t * 0.16) * 0.05;

      // stronger parallax
      const px = mx * 0.55;
      const py = my * 0.45;

      // Blob positions (always separated)
      let b1x = width * (0.28 + drift1X + px * 0.28);
      let b1y = height * (0.42 + drift1Y + py * 0.22);

      let b2x = width * (0.72 + drift2X - px * 0.28);
      let b2y = height * (0.58 + drift2Y - py * 0.22);

      // Distance and merge strength
      const dx = b2x - b1x;
      const dy = b2y - b1y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const mergeThreshold = width * 0.52;
      const merge = Math.max(0, 1 - dist / mergeThreshold);

      // Radius stays controlled (black visible)
      const r1 = width * (0.34 + merge * 0.05);
      const r2 = width * (0.34 + merge * 0.05);

      // Blur (premium, not overkill)
      glowCtx.filter = "blur(60px)";
      glowCtx.globalCompositeOperation = "screen";

      // Glow blob (left)
      drawGlow(b1x, b1y, r1, "rgba(20, 95, 136, ", 0.52);

      // Glow blob (right)
      drawGlow(b2x, b2y, r2, "rgba(20, 95, 136, ", 0.48);

      // Bridge metaball (only when close)
      if (merge > 0.05) {
        const midX = (b1x + b2x) / 2;
        const midY = (b1y + b2y) / 2;

        drawGlow(
          midX,
          midY,
          width * (0.26 + merge * 0.1),
          "rgba(255, 255, 255, ",
          0.04 + merge * 0.12
        );

        drawGlow(
          midX,
          midY,
          width * (0.32 + merge * 0.12),
          "rgba(20, 95, 136, ",
          0.06 + merge * 0.08
        );

        drawGlow(
          midX,
          midY,
          width * (0.32 + merge * 0.12),
          "rgba(20, 95, 136, ",
          0.05 + merge * 0.07
        );
      }

      glowCtx.filter = "none";
      glowCtx.globalCompositeOperation = "source-over";

      // Render glow layer (keep black dominant)
      ctx.globalAlpha = 0.78;
      ctx.drawImage(glowCanvas, 0, 0);
      ctx.globalAlpha = 1;

      // Grain overlay
      if (grainCtx) {
        ctx.globalCompositeOperation = "overlay";
        ctx.globalAlpha = 0.12;

        const ox = (t * 10) % grainCanvas.width;
        const oy = (t * 8) % grainCanvas.height;

        for (let x = -grainCanvas.width; x < width + grainCanvas.width; x += grainCanvas.width) {
          for (let y = -grainCanvas.height; y < height + grainCanvas.height; y += grainCanvas.height) {
            ctx.drawImage(grainCanvas, x - ox, y - oy);
          }
        }

        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
