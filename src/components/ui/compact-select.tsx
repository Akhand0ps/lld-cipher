"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CompactSelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

export interface CompactSelectProps<T extends string = string> {
  value: T;
  onValueChange: (value: T) => void;
  options: CompactSelectOption<T>[];
  prefixLabel?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CompactSelect<T extends string = string>({
  value,
  onValueChange,
  options,
  prefixLabel,
  placeholder = "Select...",
  className,
  disabled = false,
}: CompactSelectProps<T>) {
  const currentOption = options.find((opt) => opt.value === value);

  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={(nextVal) => {
        if (typeof nextVal === "string") {
          onValueChange(nextVal as T);
        }
      }}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "h-7.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#e7e5e4] bg-[#f0eee9] hover:bg-[#e7e5e4] text-xs font-medium text-[#1c1917] cursor-pointer shadow-2xs transition-colors outline-none focus-visible:ring-1 focus-visible:ring-[#1c1917] select-none",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
      >
        {prefixLabel && (
          <span className="text-[#78716c] font-normal">{prefixLabel}</span>
        )}
        <span className="font-medium text-[#1c1917] truncate max-w-44">
          {currentOption ? currentOption.label : placeholder}
        </span>
        <ChevronDown className="h-3 w-3 text-[#78716c] shrink-0 ml-0.5" />
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          side="bottom"
          sideOffset={4}
          align="start"
          className="isolate z-50"
        >
          <SelectPrimitive.Popup
            className={cn(
              "isolate z-50 min-w-44 max-h-60 overflow-y-auto rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] p-1 shadow-lg ring-1 ring-black/5 duration-100",
              "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
            )}
          >
            <SelectPrimitive.List className="space-y-0.5">
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    "relative flex items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-xs font-medium cursor-pointer outline-none select-none transition-colors",
                    "text-[#57534e] hover:bg-[#f0eee9] hover:text-[#1c1917]",
                    "data-highlighted:bg-[#f0eee9] data-highlighted:text-[#1c1917]",
                    opt.value === value && "bg-[#faf8f5] text-[#1c1917] font-semibold"
                  )}
                >
                  <div className="flex flex-col">
                    <SelectPrimitive.ItemText className="text-xs">
                      {opt.label}
                    </SelectPrimitive.ItemText>
                    {opt.description && (
                      <span className="text-[10px] text-[#78716c] font-normal">
                        {opt.description}
                      </span>
                    )}
                  </div>
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-3.5 w-3.5 text-[#1c1917] shrink-0" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
