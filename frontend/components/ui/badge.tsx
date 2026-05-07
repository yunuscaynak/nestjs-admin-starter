import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(34,40,49,0.65)] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[var(--ink-muted)]",
        className,
      )}
      {...props}
    />
  );
}
