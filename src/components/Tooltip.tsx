import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top - 6
      });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div 
        ref={containerRef} 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        className="flex"
      >
        {children}
      </div>
      {isVisible && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9999] px-2 py-1 text-[11px] font-medium text-white bg-slate-800 rounded shadow-md pointer-events-none whitespace-nowrap -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in-95 duration-100"
          style={{ left: coords.x, top: coords.y }}
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[5px] border-transparent border-t-slate-800" />
        </div>,
        document.body
      )}
    </>
  );
};
