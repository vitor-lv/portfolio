import { useState, useEffect } from "react";

type TypingTextProps = {
  text: string;
  /** Milliseconds per character (lower = faster). Default 25. */
  speed?: number;
  /** Delay before typing starts (ms). Default 0. */
  delay?: number;
  /** Optional cursor character (e.g. "|"). Omitted if not provided. */
  cursor?: string;
};

export default function TypingText({
  text,
  speed = 25,
  delay = 0,
  cursor,
}: TypingTextProps) {
  const [length, setLength] = useState(0);
  const [started, setStarted] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0 && !started) {
      const t = setTimeout(() => setStarted(true), delay);
      return () => clearTimeout(t);
    }
  }, [delay, started]);

  useEffect(() => {
    if (!started || length >= text.length) return;
    const t = setTimeout(() => setLength((n) => n + 1), speed);
    return () => clearTimeout(t);
  }, [started, length, text.length, speed]);

  const visible = started ? text.slice(0, length) : "";

  return (
    <span>
      {visible}
      {cursor != null && started && length < text.length ? (
        <span className="typingCursor" aria-hidden>{cursor}</span>
      ) : null}
    </span>
  );
}
