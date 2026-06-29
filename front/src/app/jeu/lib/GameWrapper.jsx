'use client';
import { useRef, useState, useEffect } from 'react';

const BASE_W = 1400;
const BASE_H = 875;

export default function GameWrapper({ children }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const el = containerRef.current?.parentElement;
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / BASE_W, height / BASE_H));
    };

    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current?.parentElement) {
      ro.observe(containerRef.current.parentElement);
    }
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: BASE_W,
        height: BASE_H,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      {children}
    </div>
  );
}