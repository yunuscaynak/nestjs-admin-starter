import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function PostNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(0,173,181,0.16),transparent_26%),linear-gradient(180deg,#1D232B_0%,#393E46_100%)] px-4">
      <Card className="w-full max-w-2xl bg-[rgba(57,62,70,0.82)]">
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
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-strong)]"
            >
              Listeye don
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
