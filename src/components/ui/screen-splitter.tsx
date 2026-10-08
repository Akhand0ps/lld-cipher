"use client";

import React, { useState } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreenSplitterProps {
  isDragging: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onDoubleClick?: () => void;
  splitRatio: number;
  className?: string;
}

export const ScreenSplitter: React.FC<ScreenSplitterProps> = ({
  isDragging,
  onPointerDown,
  onMouseDown,
  onTouchStart,
  onDoubleClick,
  splitRatio,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={Math.round(splitRatio)}
      aria-label="Resize workspace panes"
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={onPointerDown}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onDoubleClick={onDoubleClick}
      className={cn(
        // Desktop splitter: vertical seam with comfortable 12px grab area
        "hidden lg:flex relative items-center justify-center select-none cursor-col-resize z-20 shrink-0",
        "w-3 -mx-1.5 h-full group outline-none",
        className
      )}
      title="Drag left or right to resize • Double-click to reset (50%)"
    >
      {/* Visual divider line in the center */}
      <div
        className={cn(
          "w-[1px] h-full transition-colors duration-150 pointer-events-none",
          isDragging
            ? "bg-[#1c1917] shadow-xs"
            : isHovered
            ? "bg-[#1c1917]"
            : "bg-[#e7e5e4]"
        )}
      />

      {/* Tactile Centered Grab Pill (LeetCode style) */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-150 pointer-events-none",
          "h-9 w-3.5 rounded-full border shadow-2xs",
          isDragging
            ? "bg-[#1c1917] border-[#1c1917] text-white scale-110 shadow-md"
            : isHovered
            ? "bg-white border-[#1c1917] text-[#1c1917] scale-105 shadow-xs"
            : "bg-[#faf8f5] border-[#d6d3d1] text-[#78716c]"
        )}
      >
        <GripVertical
          className={cn(
            "h-3.5 w-3.5 transition-colors",
            isDragging
              ? "text-white"
              : isHovered
              ? "text-[#1c1917]"
              : "text-[#78716c]"
          )}
        />
      </div>

      {/* Live Split Ratio Percentage Tooltip */}
      {isDragging && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 pointer-events-none z-30">
          <div className="bg-[#1c1917] text-[#faf8f5] text-[10px] font-mono font-medium px-2 py-0.5 rounded-full shadow-md whitespace-nowrap flex items-center gap-1.5 border border-[#44403c]">
            <span>{Math.round(splitRatio)}%</span>
            <span className="text-[#a8a29e]">|</span>
            <span>{Math.round(100 - splitRatio)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
