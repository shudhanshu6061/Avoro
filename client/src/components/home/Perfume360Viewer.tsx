'use client';

import { useState, useEffect, useRef } from 'react';

export default function Perfume360Viewer() {
  const [frame, setFrame] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startFrame = useRef(1);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  // Preload all 72 frames for flicker-free rotation
  useEffect(() => {
    for (let i = 1; i <= 72; i++) {
      const img = new window.Image();
      img.src = `/images/perfume/${String(i).padStart(4, '0')}.webp`;
    }
  }, []);

  // Autoplay rotation
  useEffect(() => {
    if (isDragging) return;

    autoRotateRef.current = setInterval(() => {
      setFrame(prev => (prev >= 72 ? 1 : prev + 1));
    }, 120);

    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    startFrame.current = frame;
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX.current;
    
    // Sensitivity: 6px drag = 1 frame rotation
    const frameOffset = Math.floor(deltaX / 6);
    let newFrame = startFrame.current - frameOffset;
    
    // Wrap frame around 1 to 72
    newFrame = ((newFrame - 1) % 72 + 72) % 72 + 1;
    setFrame(newFrame);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
    startFrame.current = frame;
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - startX.current;
    
    // Sensitivity: 4px swipe = 1 frame rotation on touch screens
    const frameOffset = Math.floor(deltaX / 4);
    let newFrame = startFrame.current - frameOffset;
    
    newFrame = ((newFrame - 1) % 72 + 72) % 72 + 1;
    setFrame(newFrame);
  };

  const currentImgSrc = `/images/perfume/${String(frame).padStart(4, '0')}.webp`;

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUpOrLeave}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      <div style={{ width: '360px', height: '480px', pointerEvents: 'none' }}>
        <img
          src={currentImgSrc}
          alt="Avoro Velvet Oud 3D"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Subtle interaction cue */}
      <div style={{
        position: 'absolute',
        bottom: '-12px',
        fontFamily: 'var(--font-ui)',
        fontSize: '0.62rem',
        color: 'var(--text-soft)',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        opacity: isDragging ? 0.3 : 0.7,
        transition: 'opacity 0.3s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Drag to Rotate 360°
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </div>
  );
}
