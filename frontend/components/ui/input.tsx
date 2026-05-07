import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-2xl border border-[var(--line)] bg-[rgba(34,40,49,0.9)] px-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(0,173,181,0.2)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
