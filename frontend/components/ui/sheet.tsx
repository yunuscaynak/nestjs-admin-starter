import { cn } from "@/lib/utils";

export function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[rgba(34,40,49,0.6)] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <aside
        className="h-full w-full max-w-xl overflow-y-auto border-l border-[var(--line)] bg-[linear-gradient(180deg,rgba(57,62,70,0.98),rgba(34,40,49,0.98))] p-6 shadow-[-24px_0_80px_rgba(0,0,0,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </aside>
    </div>
  );
}

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mb-6 flex items-start justify-between gap-4", className)}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("font-serif text-3xl font-semibold", className)} {...props} />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mt-2 text-sm text-[var(--ink-muted)]", className)} {...props} />
  );
}
