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
    const targetMouse = { x: 0.5, y: 0.5 };

    // Create grain texture (offscreen canvas)
    const grainCanvas = document.createElement("canvas");
    const grainCtx = grainCanvas.getContext("2d");

    const generateGrain = () => {
      if (!grainCtx) return;

      const grainSize = 220;
      grainCanvas.width = grainSize;
      grainCanvas.height = grainSize;

      const imageData = grainCtx.createImageData(grainSize, grainSize);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.floor(Math.random() * 255);
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 35; // alpha
      }

      grainCtx.putImageData(imageData, 0, 0);
    };

    generateGrain();

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX / width;
      targetMouse.y = e.clientY / height;
    };

    window.addEventListener("mousemove", onMouseMove);

    let rafId = 0;

    const animate = (time: number) => {
      const t = time * 0.001; // seconds

      // Smooth follow (premium easing)
      mouse.x += (targetMouse.x - mouse.x) * 0.045;
      mouse.y += (targetMouse.y - mouse.y) * 0.045;

      ctx.clearRect(0, 0, width, height);

      // Base background
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      // Slow drift values (so it moves even without mouse)
      const driftX1 = Math.sin(t * 0.4) * 0.06;
      const driftY1 = Math.cos(t * 0.35) * 0.06;

      const driftX2 = Math.cos(t * 0.32) * 0.07;
      const driftY2 = Math.sin(t * 0.28) * 0.07;

      // Blob 1 (purple)
      const blob1X = width * (0.25 + mouse.x * 0.25 + driftX1);
      const blob1Y = height * (0.3 + mouse.y * 0.25 + driftY1);

      const grad1 = ctx.createRadialGradient(
        blob1X,
        blob1Y,
        0,
        blob1X,
        blob1Y,
        width * 0.7
      );

      grad1.addColorStop(0, "rgba(120, 60, 255, 0.65)");
      grad1.addColorStop(0.4, "rgba(120, 60, 255, 0.18)");
      grad1.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Blob 2 (blue)
      const blob2X = width * (0.75 - mouse.x * 0.25 + driftX2);
      const blob2Y = height * (0.55 - mouse.y * 0.2 + driftY2);

      const grad2 = ctx.createRadialGradient(
        blob2X,
        blob2Y,
        0,
        blob2X,
        blob2Y,
        width * 0.75
      );

      grad2.addColorStop(0, "rgba(0, 180, 255, 0.55)");
      grad2.addColorStop(0.45, "rgba(0, 180, 255, 0.14)");
      grad2.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Extra subtle glow layer (depth)
      const glowX = width * (0.5 + Math.sin(t * 0.15) * 0.12);
      const glowY = height * (0.5 + Math.cos(t * 0.18) * 0.12);

      const grad3 = ctx.createRadialGradient(
        glowX,
        glowY,
        0,
        glowX,
        glowY,
        width * 0.9
      );

      grad3.addColorStop(0, "rgba(255, 255, 255, 0.06)");
      grad3.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);

      // Grain overlay (NO flicker)
      if (grainCtx) {
        ctx.globalAlpha = 0.20;
        ctx.globalCompositeOperation = "overlay";

        const grainOffsetX = (t * 18) % grainCanvas.width;
        const grainOffsetY = (t * 14) % grainCanvas.height;

        for (let x = -grainCanvas.width; x < width + grainCanvas.width; x += grainCanvas.width) {
          for (let y = -grainCanvas.height; y < height + grainCanvas.height; y += grainCanvas.height) {
            ctx.drawImage(
              grainCanvas,
              x - grainOffsetX,
              y - grainOffsetY
            );
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
