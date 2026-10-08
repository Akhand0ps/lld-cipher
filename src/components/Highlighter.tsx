import React from "react";

interface HighlighterProps {
  children: React.ReactNode;
  variant?: "yellow" | "blue";
  showCursor?: boolean;
  className?: string;
}

/**
 * Developer-native Highlighter component inspired by collaborative canvas cursors
 * Clean pastel fill, matching border, mono typography.
 * Cursor pointer is off by default and hidden on mobile to avoid visual clutter.
 */
export const Highlighter: React.FC<HighlighterProps> = ({
  children,
  variant = "yellow",
  showCursor = false,
  className = "",
}) => {
  const isYellow = variant === "yellow";

  return (
    <span
      className={`relative inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-[3px] font-mono text-[0.92em] font-medium leading-tight align-baseline select-none transition-transform hover:scale-[1.02] ${
        isYellow
          ? "bg-[#fef3c7] border border-[#f59e0b] text-stone-900 shadow-[0_1px_2px_rgba(245,158,11,0.15)]"
          : "bg-[#eff6ff] border border-[#93c5fd] text-stone-900 shadow-[0_1px_2px_rgba(147,197,253,0.15)]"
      } ${className}`}
    >
      <span>{children}</span>
      {showCursor && (
        <span
          className="hidden sm:inline-block absolute -bottom-2 -right-2 pointer-events-none select-none z-20"
          aria-hidden="true"
        >
          <svg
            className="w-3 h-3 text-amber-500 fill-amber-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]"
            viewBox="0 0 24 24"
          >
            <path d="M4 4l6 16 3-6 6-3L4 4z" />
          </svg>
        </span>
      )}
    </span>
  );
};

interface HighlightBlockProps {
  children: React.ReactNode;
  variant?: "blue" | "yellow";
  showCursor?: boolean;
  className?: string;
}

/**
 * Full-width or inline block highlight matching user's reference image
 */
export const HighlightBlock: React.FC<HighlightBlockProps> = ({
  children,
  variant = "blue",
  showCursor = false,
  className = "",
}) => {
  const isBlue = variant === "blue";

  return (
    <div
      className={`relative p-3.5 sm:p-4 rounded-xl font-mono text-xs sm:text-sm leading-relaxed ${
        isBlue
          ? "bg-[#f0f7ff] border border-[#bfdbfe] text-stone-900"
          : "bg-[#fefce8] border border-[#fde047] text-stone-900"
      } ${className}`}
    >
      <div>{children}</div>
      {showCursor && (
        <span
          className="hidden sm:inline-block absolute -bottom-2.5 -right-2 pointer-events-none select-none z-20"
          aria-hidden="true"
        >
          <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]" viewBox="0 0 24 24">
            <path d="M4 4l6 16 3-6 6-3L4 4z" />
          </svg>
        </span>
      )}
    </div>
  );
};
