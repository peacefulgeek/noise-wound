import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import ArticleCard from "@/components/ArticleCard";

export default function Articles() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { data, isLoading } = trpc.articles.list.useQuery({ limit: 200, category });
  const articles = data?.articles ?? [];

  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => set.add(a.category));
    return Array.from(set).sort();
  }, [articles]);

  return (
    <div className="container py-10">
      <p className="section-label">The archive</p>
      <h1 className="masthead text-[clamp(2.4rem,5vw,4rem)] mt-3 leading-[0.95]">
        Every column we have ever set.
      </h1>
      <p className="font-serif italic text-foreground/70 text-lg mt-3 max-w-2xl">
        Browse the full broadsheet, sorted by section. Every article is queue-vetted
        before publication and links to neuroscience, lived experience, and the
        recommended quiet kit.
      </p>

      <div className="rule-double mt-8">
        <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center font-sans uppercase tracking-[0.16em] text-xs">
          <button
            onClick={() => setCategory(undefined)}
            className={category === undefined ? "text-[var(--rust)] underline" : "text-foreground/70 hover:text-[var(--rust)]"}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={category === c ? "text-[var(--rust)] underline" : "text-foreground/70 hover:text-[var(--rust)]"}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="font-serif italic text-center py-12">The presses are running…</p>
      ) : articles.length === 0 ? (
        <p className="font-serif italic text-center py-12">No columns in this section yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {articles.map((a) => (
            <ArticleCard
              key={a.slug}
              size="primary"
              slug={a.slug}
              title={a.title}
              metaDescription={a.metaDescription}
              category={a.category}
              heroUrl={a.heroUrl}
              heroAlt={a.heroAlt}
              publishedAt={a.publishedAt as unknown as string}
            />
          ))}
        </div>
      )}
    </div>
  );
}
