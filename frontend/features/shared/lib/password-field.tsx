import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PasswordField({
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
  required = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={visible ? "text" : "password"}
        minLength={8}
        required={required}
        className="pr-14"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-9 w-9 text-[var(--ink-muted)]"
        onClick={onToggle}
        aria-label={visible ? "Sifreyi gizle" : "Sifreyi goster"}
      >
        <FontAwesomeIcon
          icon={visible ? faEyeSlash : faEye}
          className="h-4 w-4"
        />
      </Button>
    </div>
  );
}
