"use client";

import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface SegmentedItem<T extends string = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedTabsProps<T extends string = string> {
  items: SegmentedItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  size?: "sm" | "default";
}

export function SegmentedTabs<T extends string = string>({
  items,
  value,
  onValueChange,
  className,
  size = "sm",
}: SegmentedTabsProps<T>) {
  const instanceId = useId();
  const reduceMotion = useReducedMotion() ?? false;
  const isSm = size === "sm";

  return (
    <div
      role="tablist"
      className={cn(
        "relative inline-flex max-w-full items-center p-0.5 rounded-lg bg-[#f0eee9] border border-[#e7e5e4] shadow-2xs gap-0.5 select-none overflow-x-auto scrollbar-none min-w-0",
        className
      )}
    >
      {items.map((item) => {
        const isSelected = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={isSelected}
            disabled={item.disabled}
            onClick={() => onValueChange(item.value)}
            className={cn(
              "relative z-1 inline-flex items-center justify-center font-medium transition-colors cursor-pointer outline-none select-none rounded-md shrink-0 whitespace-nowrap min-w-0",
              isSm ? "h-7 px-2.5 text-xs" : "h-7.5 px-3 text-xs",
              isSelected
                ? "text-[#1c1917] font-semibold"
                : "text-[#78716c] hover:text-[#1c1917]",
              item.disabled && "opacity-40 cursor-not-allowed pointer-events-none"
            )}
          >
            {isSelected && (
              <motion.span
                layoutId={`tab-active-${instanceId}`}
                aria-hidden="true"
                className="absolute inset-0 rounded-md bg-white border border-[#e7e5e4] shadow-xs -z-1"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", bounce: 0.12, duration: 0.28 }
                }
              />
            )}
            <span className="relative z-1 flex items-center gap-1.5">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
