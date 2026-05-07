import { cn } from "@/lib/utils";

export function CheckboxField({
  className,
  children,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { children: React.ReactNode }) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-3 text-sm text-[var(--ink-muted)]",
        className,
      )}
    >
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-[var(--line)] accent-[var(--accent)]"
        {...props}
      />
      <span>{children}</span>
    </label>
  );
}
