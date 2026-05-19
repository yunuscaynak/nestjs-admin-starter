import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { IconLabel } from "@/features/shared/lib/icon-label";
import type { UserSortOption } from "@/features/users/types";

type UserFiltersSheetProps = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  clearDisabled: boolean;
  searchInput: string;
  setSearchInput: (value: string) => void;
  sort: UserSortOption;
  setSort: (value: UserSortOption) => void;
  limit: number;
  setLimit: (value: number) => void;
  submit: (event: React.FormEvent<HTMLFormElement>) => void;
  clear: () => void;
  sortOptions: Array<{ label: string; value: UserSortOption }>;
  limitOptions: readonly number[];
};

export function UserFiltersSheet({
  open,
  onClose,
  loading,
  clearDisabled,
  searchInput,
  setSearchInput,
  sort,
  setSort,
  limit,
  setLimit,
  submit,
  clear,
  sortOptions,
  limitOptions,
}: UserFiltersSheetProps) {
  return (
    <Sheet open={open} onClose={onClose}>
      <SheetHeader>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            Filtreler
          </p>
          <SheetTitle>Kullanici Filtreleri</SheetTitle>
          <SheetDescription>
            Arama, siralama ve sayfa boyutunu bu panelden yonetin.
          </SheetDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Kapat">
          <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
        </Button>
      </SheetHeader>

      <form onSubmit={submit} className="grid gap-5">
        <div className="grid gap-2">
          <Label>Ara</Label>
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Ad veya e-posta ara"
          />
        </div>
        <div className="grid gap-2">
          <Label>Sirala</Label>
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value as UserSortOption)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Gorunum</Label>
          <Select
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
          >
            {limitOptions.map((option) => (
              <option key={option} value={option}>
                {option} / sayfa
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            <IconLabel icon={faMagnifyingGlass}>Uygula</IconLabel>
          </Button>
          <Button type="button" variant="outline" onClick={clear} disabled={clearDisabled}>
            <IconLabel icon={faXmark}>Temizle</IconLabel>
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
