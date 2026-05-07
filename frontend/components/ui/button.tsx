import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "destructive" | "ghost";
type ButtonSize = "default" | "sm" | "icon";

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[0_12px_30px_rgba(0,173,181,0.25)] hover:bg-[var(--accent-strong)]",
  secondary:
    "bg-[var(--panel-soft)] text-[var(--ink)] hover:bg-[var(--panel)]",
  outline:
    "border border-[var(--line)] bg-[rgba(57,62,70,0.72)] text-[var(--ink)] hover:bg-[rgba(57,62,70,0.92)]",
  destructive:
    "bg-[var(--danger)] text-white hover:bg-[var(--danger-strong)]",
  ghost:
    "bg-transparent text-[var(--ink-muted)] hover:bg-[rgba(57,62,70,0.72)] hover:text-[var(--ink)]",
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
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:pointer-events-none disabled:opacity-50",
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
