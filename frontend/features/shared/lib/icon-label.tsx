import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export function IconLabel({
  icon,
  children,
}: {
  icon: IconDefinition;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
      <span>{children}</span>
    </span>
  );
}
