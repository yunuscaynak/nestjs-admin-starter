import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-32 w-full rounded-[24px] border border-[var(--line)] bg-[rgba(34,40,49,0.9)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(0,173,181,0.2)]",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
