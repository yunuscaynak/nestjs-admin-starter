import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "destructive" | "ghost";
type ButtonSize = "default" | "sm" | "icon";

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[0_10px_24px_rgba(14,165,233,0.22)] hover:bg-[var(--accent-strong)]",
  secondary:
    "bg-[var(--panel-soft)] text-[var(--ink)] hover:bg-[var(--panel-muted)]",
  outline:
    "border border-[var(--line)] bg-[var(--panel-deep)] text-[var(--ink)] hover:border-[var(--line-strong)] hover:bg-[var(--panel-soft)]",
  destructive:
    "bg-[var(--danger)] text-white hover:bg-[var(--danger-strong)]",
  ghost:
    "bg-transparent text-[var(--ink-muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--ink)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-11 px-4 text-sm",
  sm: "h-9 px-3 text-sm",
  icon: "h-10 w-10 p-0",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "default", type = "button", ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
