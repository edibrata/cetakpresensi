import React, { useState, useRef, useEffect } from 'react';

export const MapelInput = ({ 
  value, 
  onChange, 
  options, 
  placeholder,
  className
}: { 
  value: string, 
  onChange: (val: string) => void, 
  options: string[], 
  placeholder?: string,
  className?: string
}) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  const updatePos = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setPos(prev => {
        if (prev.top === rect.bottom && prev.left === rect.left && prev.width === rect.width) return prev;
        return {
          top: rect.bottom,
          left: rect.left,
          width: rect.width
        };
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    const handleScroll = () => updatePos();

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div className="relative w-full flex" ref={wrapperRef}>
      <input 
        type="text" 
        className={className || "w-full border border-slate-200 rounded p-1 text-[10px] mb-1 focus:border-blue-400 focus:outline-none"} 
        placeholder={placeholder || "Nama Mapel..."}
        value={value} 
        onChange={(e) => {
          onChange(e.target.value);
          updatePos();
          setOpen(true);
        }}
        onClick={() => {
          updatePos();
          setOpen(true);
        }}
      />
      {open && options.length > 0 && (
        <div 
          className="fixed z-[99999] bg-white border border-slate-200 rounded shadow-lg max-h-40 overflow-y-auto mt-1"
          style={{
            top: pos.top,
            left: pos.left,
            minWidth: Math.max(120, pos.width)
          }}
        >
          {options.map(o => (
            <div 
              key={o} 
              className="p-2 text-[10px] sm:text-xs hover:bg-slate-100 cursor-pointer text-slate-700 font-medium border-b border-slate-50 last:border-b-0"
              onClick={() => {
                const newVal = o === 'Lainnya' ? '' : o;
                onChange(newVal);
                setOpen(false);
              }}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
