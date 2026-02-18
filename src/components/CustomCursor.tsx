import { useEffect, useRef, useState } from "react";
import "./CustomCursor.css";

const SIZE = 28;

export default function CustomCursor() {
  const [hasPointer, setHasPointer] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isFine = window.matchMedia("(pointer: fine)").matches;
    if (!isFine) return;
    setHasPointer(true);
  }, []);

  useEffect(() => {
    if (!hasPointer) return;

    document.body.classList.add("customCursorActive");

    const onMove = (e: MouseEvent) => {
      const el = elRef.current;
      if (el) {
        el.style.transform = `translate(${e.clientX - SIZE / 2}px, ${e.clientY - SIZE / 2}px)`;
        el.style.opacity = "1";
      }
    };

    const onLeave = () => {
      const el = elRef.current;
      if (el) el.style.opacity = "0";
    };

    const onEnter = () => {
      const el = elRef.current;
      if (el) el.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      document.body.classList.remove("customCursorActive");
    };
  }, [hasPointer]);

  if (!hasPointer) return null;

  return (
    <div
      ref={elRef}
      className="customCursor"
      aria-hidden
      style={{
        width: SIZE,
        height: SIZE,
        opacity: 0,
      }}
    />
  );
}
