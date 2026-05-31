import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function PostNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="space-y-5 p-8 text-center">
          <Badge>404</Badge>
          <h1 className="font-serif text-4xl text-(--ink)">
            Bu public post artik mevcut degil.
          </h1>
          <p className="text-sm leading-6 text-(--ink-muted)">
            Icerik silinmis olabilir veya henuz published durumda degildir.
          </p>
          <div className="flex justify-center">
            <Link
              href="/posts"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-strong)]"
            >
              Listeye don
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
