import { faBan, faFloppyDisk, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { IconLabel } from "@/features/shared/lib/icon-label";
import { getFullName } from "@/features/shared/lib/helpers";
import type { UserRecord } from "@/features/users/types";

type PostSheetProps = {
  open: boolean;
  onClose: () => void;
  error: string;
  isEditing: boolean;
  editingId: string | null;
  loading: boolean;
  authorOptions: UserRecord[];
  form: {
    title: string;
    content: string;
    authorId: string;
    published: boolean;
    setTitle: (value: string) => void;
    setContent: (value: string) => void;
    setAuthorId: (value: string) => void;
    setPublished: (value: boolean) => void;
    submit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  };
  editForm: {
    title: string;
    content: string;
    authorId: string;
    published: boolean;
    setTitle: (value: string) => void;
    setContent: (value: string) => void;
    setAuthorId: (value: string) => void;
    setPublished: (value: boolean) => void;
    submit: (id: string) => Promise<void>;
  };
};

export function PostSheet({
  open,
  onClose,
  error,
  isEditing,
  editingId,
  loading,
  authorOptions,
  form,
  editForm,
}: PostSheetProps) {
  return (
    <Sheet open={open} onClose={onClose}>
      <SheetHeader>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--ink-muted)">
            {isEditing ? "Guncelle" : "Yeni Post"}
          </p>
          <SheetTitle>{isEditing ? "Post Duzenle" : "Post Ekle"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Baslik, yazar, durum ve icerik alanlarini ayri panelden guncelleyin."
              : "Yeni post bilgisini liste akisini bozmadan sag panelden ekleyin."}
          </SheetDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Kapat">
          <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
        </Button>
      </SheetHeader>

      {error ? (
        <p className="mb-4 rounded-xl border border-[rgba(248,113,113,0.24)] bg-[rgba(127,29,29,0.26)] px-4 py-3 text-sm font-medium text-(--danger)">
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
            value={editForm.title}
            onChange={(event) => editForm.setTitle(event.target.value)}
            placeholder="Baslik"
            required
            minLength={3}
            maxLength={160}
          />
          <Select
            value={editForm.authorId}
            onChange={(event) => editForm.setAuthorId(event.target.value)}
            required
          >
            {authorOptions.map((author) => (
              <option key={author.id} value={author.id}>
                {getFullName(author)} · {author.email}
              </option>
            ))}
          </Select>
          <CheckboxField
            checked={editForm.published}
            onChange={(event) => editForm.setPublished(event.target.checked)}
          >
            Yayinda
          </CheckboxField>
          <Textarea
            value={editForm.content}
            onChange={(event) => editForm.setContent(event.target.value)}
            placeholder="Icerik"
            required
            minLength={10}
            maxLength={5000}
            rows={7}
          />
          <p className="text-xs text-(--ink-muted)">
            Icerik en az 10 karakter olmali.
          </p>
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
            value={form.title}
            onChange={(event) => form.setTitle(event.target.value)}
            placeholder="Baslik"
            required
            minLength={3}
            maxLength={160}
          />
          <Select
            value={form.authorId}
            onChange={(event) => form.setAuthorId(event.target.value)}
            required
          >
            <option value="" disabled>
              Yazar sec
            </option>
            {authorOptions.map((author) => (
              <option key={author.id} value={author.id}>
                {getFullName(author)} · {author.email}
              </option>
            ))}
          </Select>
          <CheckboxField
            checked={form.published}
            onChange={(event) => form.setPublished(event.target.checked)}
          >
            Hemen yayinla
          </CheckboxField>
          <Textarea
            value={form.content}
            onChange={(event) => form.setContent(event.target.value)}
            placeholder="Icerik"
            required
            minLength={10}
            maxLength={5000}
            rows={7}
          />
          <p className="text-xs text-(--ink-muted)">
            Icerik en az 10 karakter olmali.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={loading || !form.authorId}>
              <IconLabel icon={faPlus}>Post Ekle</IconLabel>
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
