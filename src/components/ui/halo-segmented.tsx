"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const layoutSpring = {
  type: "spring" as const,
  bounce: 0.12,
  damping: 32,
  stiffness: 450,
};

export interface HaloSegmentedItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface HaloSegmentedProps {
  items: HaloSegmentedItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (next: string) => void;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "default";
}

export function HaloSegmented({
  items,
  value: valueProp,
  defaultValue,
  onValueChange,
  className,
  disabled = false,
  size = "sm",
}: HaloSegmentedProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [thumb, setThumb] = useState({ x: 0, width: 0 });

  const isControlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = useState(
    defaultValue ?? items[0]?.value ?? ""
  );
  const selected = isControlled ? (valueProp ?? "") : uncontrolled;

  const setSelected = useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolled(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  const groupValue = useMemo(() => (selected ? [selected] : []), [selected]);

  const measureThumb = useCallback(() => {
    const track = trackRef.current;
    const active = selected ? itemRefs.current.get(selected) : undefined;
    if (!(track && active)) {
      setThumb({ x: 0, width: 0 });
      return;
    }
    const tr = track.getBoundingClientRect();
    const br = active.getBoundingClientRect();
    setThumb({
      x: br.left - tr.left,
      width: br.width,
    });
  }, [selected]);

  useLayoutEffect(() => {
    measureThumb();
  }, [measureThumb]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === "undefined") {
      return;
    }
    const ro = new ResizeObserver(() => measureThumb());
    ro.observe(track);
    return () => ro.disconnect();
  }, [measureThumb]);

  const isSm = size === "sm";

  return (
    <div
      className={cn(
        "relative inline-flex max-w-full items-center rounded-xl p-0.5 bg-[#f0eee9] border border-[#e7e5e4] shadow-2xs",
        className
      )}
      ref={trackRef}
    >
      {/* Sliding Active Pill */}
      <motion.div
        animate={{
          x: thumb.width > 0 ? thumb.x : 0,
          width: thumb.width,
        }}
        aria-hidden
        className="pointer-events-none absolute top-0.5 bottom-0.5 left-0 rounded-lg bg-white border border-[#e7e5e4] shadow-xs"
        initial={false}
        transition={reduceMotion ? { duration: 0 } : layoutSpring}
      />

      <ToggleGroup
        className="relative z-1 flex min-w-0 items-center gap-0.5"
        disabled={disabled}
        multiple={false}
        onValueChange={(next) => {
          const first = next[0];
          if (typeof first === "string") {
            setSelected(first);
          }
        }}
        value={groupValue}
      >
        {items.map((item) => (
          <Toggle
            className={cn(
              "relative flex min-w-0 flex-1 items-center justify-center rounded-lg font-medium transition-colors duration-150 ease-out cursor-pointer select-none",
              isSm
                ? "h-7.5 px-3 py-1 text-xs tracking-tight"
                : "h-9 px-4 py-1.5 text-sm",
              "text-[#78716c] hover:text-[#1c1917]",
              "aria-pressed:text-[#1c1917] aria-pressed:font-semibold",
              "disabled:pointer-events-none disabled:opacity-50 outline-none"
            )}
            disabled={item.disabled}
            key={item.value}
            ref={(el) => {
              if (el) {
                itemRefs.current.set(item.value, el);
              } else {
                itemRefs.current.delete(item.value);
              }
            }}
            value={item.value}
          >
            {item.label}
          </Toggle>
        ))}
      </ToggleGroup>
    </div>
  );
}
