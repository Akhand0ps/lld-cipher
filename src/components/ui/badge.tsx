import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#1c1917] text-[#faf8f5] shadow-xs",
        secondary:
          "border-transparent bg-[#f0eee9] text-[#57534e] hover:bg-[#e7e5e4]",
        destructive:
          "border-transparent bg-red-100 text-red-900 border-red-200",
        outline: "text-[#57534e] border-[#e7e5e4] bg-white",
        success: "bg-emerald-50 text-emerald-800 border-emerald-200",
        warning: "bg-amber-50 text-amber-900 border-amber-200",
        purple: "bg-purple-50 text-purple-900 border-purple-200",
        blue: "bg-blue-50 text-blue-900 border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
