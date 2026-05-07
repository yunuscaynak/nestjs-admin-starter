import { faBan, faFloppyDisk, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { IconLabel } from "@/features/shared/lib/icon-label";
import { PasswordField } from "@/features/shared/lib/password-field";
import type { Role } from "@/features/shared/lib/types";

type UserSheetProps = {
  open: boolean;
  onClose: () => void;
  error: string;
  isEditing: boolean;
  editingId: string | null;
  loading: boolean;
  form: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    showPassword: boolean;
    setFirstName: (value: string) => void;
    setLastName: (value: string) => void;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    setRole: (value: Role) => void;
    togglePassword: () => void;
    submit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  };
  editForm: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    showPassword: boolean;
    setFirstName: (value: string) => void;
    setLastName: (value: string) => void;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    setRole: (value: Role) => void;
    togglePassword: () => void;
    submit: (id: string) => Promise<void>;
  };
};

export function UserSheet({
  open,
  onClose,
  error,
  isEditing,
  editingId,
  loading,
  form,
  editForm,
}: UserSheetProps) {
  return (
    <Sheet open={open} onClose={onClose}>
      <SheetHeader>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            {isEditing ? "Guncelle" : "Yeni Kullanici"}
          </p>
          <SheetTitle>
            {isEditing ? "Kullanici Duzenle" : "Kullanici Ekle"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Ad, rol ve sifre gibi alanlari ayri panelden guncelleyin."
              : "Yeni kullanici bilgisini listeyi bozmadan sag panelden ekleyin."}
          </SheetDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Kapat">
          <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
        </Button>
      </SheetHeader>

      {error ? (
        <p className="mb-4 rounded-2xl border border-[rgba(166,41,41,0.15)] bg-[rgba(166,41,41,0.08)] px-4 py-3 text-sm font-medium text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      {isEditing ? (
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (editingId) {
              void editForm.submit(editingId);
            }
          }}
        >
          <Input
            value={editForm.firstName}
            onChange={(event) => editForm.setFirstName(event.target.value)}
            placeholder="Ad"
            required
          />
          <Input
            value={editForm.lastName}
            onChange={(event) => editForm.setLastName(event.target.value)}
            placeholder="Soyad"
            required
          />
          <Input
            value={editForm.email}
            type="email"
            onChange={(event) => editForm.setEmail(event.target.value)}
            placeholder="E-posta"
            required
          />
          <PasswordField
            value={editForm.password}
            onChange={editForm.setPassword}
            placeholder="Yeni sifre (opsiyonel)"
            visible={editForm.showPassword}
            onToggle={editForm.togglePassword}
          />
          <Select
            value={editForm.role}
            onChange={(event) => editForm.setRole(event.target.value as Role)}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </Select>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit">
              <IconLabel icon={faFloppyDisk}>Kaydet</IconLabel>
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              <IconLabel icon={faBan}>Vazgec</IconLabel>
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={form.submit} className="grid gap-4">
          <Input
            value={form.firstName}
            onChange={(event) => form.setFirstName(event.target.value)}
            placeholder="Ad"
            required
          />
          <Input
            value={form.lastName}
            onChange={(event) => form.setLastName(event.target.value)}
            placeholder="Soyad"
            required
          />
          <Input
            value={form.email}
            onChange={(event) => form.setEmail(event.target.value)}
            placeholder="E-posta"
            type="email"
            required
          />
          <PasswordField
            value={form.password}
            onChange={form.setPassword}
            placeholder="Gecici sifre"
            visible={form.showPassword}
            onToggle={form.togglePassword}
            required
          />
          <Select
            value={form.role}
            onChange={(event) => form.setRole(event.target.value as Role)}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </Select>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              <IconLabel icon={faPlus}>Ekle</IconLabel>
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              <IconLabel icon={faBan}>Vazgec</IconLabel>
            </Button>
          </div>
        </form>
      )}
    </Sheet>
  );
}
