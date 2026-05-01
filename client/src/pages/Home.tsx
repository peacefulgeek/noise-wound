import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import ArticleCard from "@/components/ArticleCard";

export default function Home() {
  const { data, isLoading } = trpc.articles.list.useQuery({ limit: 24 });
  const articles = data?.articles ?? [];

  if (isLoading) {
    return (
      <div className="container py-20 text-center font-serif italic text-foreground/60">
        The presses are warming up…
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="container py-20">
        <h2 className="masthead text-3xl">The first edition is being typeset.</h2>
        <p className="font-serif italic text-foreground/70 mt-4 max-w-2xl">
          The Noise Wound is a queue-first newspaper. The presses run on a quiet
          schedule. Come back in a moment, or read{" "}
          <Link href="/about" className="underline">about the desk</Link> first.
        </p>
      </div>
    );
  }

  const [lead, ...rest] = articles;
  const above = rest.slice(0, 2);
  const middle = rest.slice(2, 5);
  const lower = rest.slice(5, 11);
  const tail = rest.slice(11);

  return (
    <div>
      <section className="container pt-8 pb-6">
        <div className="rule-double">
          <p className="section-label text-center">The Lead Story</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 mt-6">
          <div className="lg:col-span-2">
            {lead && (
              <ArticleCard size="lead" slug={lead.slug} title={lead.title} metaDescription={lead.metaDescription} category={lead.category} heroUrl={lead.heroUrl} heroAlt={lead.heroAlt} publishedAt={lead.publishedAt as unknown as string} />
            )}
          </div>
          <aside className="space-y-6 lg:border-l lg:border-foreground/30 lg:pl-8">
            <p className="section-label">From the desk</p>
            <h2 className="masthead text-2xl leading-tight">
              The chewing isn't the wound. The not-being-believed is the wound.
            </h2>
            <p className="font-serif italic text-foreground/70">
              This is a misophonia broadsheet, not a wellness blog. We take the
              salience network seriously, the dinner table seriously, and the
              quiet hour seriously.
            </p>
            <Link href="/about" className="ribbon">Read our stance</Link>
            <div className="ornament">— § —</div>
            {above.map((a) => (
              <ArticleCard key={a.slug} size="tertiary" slug={a.slug} title={a.title} metaDescription={a.metaDescription} category={a.category} heroUrl={a.heroUrl} heroAlt={a.heroAlt} publishedAt={a.publishedAt as unknown as string} />
            ))}
          </aside>
        </div>
      </section>

      {middle.length > 0 && (
        <section className="container pt-8 pb-2">
          <div className="rule-double"><p className="section-label text-center">Today's Columns</p></div>
          <div className="grid md:grid-cols-3 gap-8 mt-6">
            {middle.map((a) => (
              <ArticleCard key={a.slug} size="primary" slug={a.slug} title={a.title} metaDescription={a.metaDescription} category={a.category} heroUrl={a.heroUrl} heroAlt={a.heroAlt} publishedAt={a.publishedAt as unknown as string} />
            ))}
          </div>
        </section>
      )}

      <section className="container py-10">
        <div className="ornament">— § § § —</div>
        <blockquote className="masthead text-center text-[clamp(1.6rem,3vw,2.4rem)] max-w-3xl mx-auto leading-tight">
          "Misophonia isn't a hatred of sound. It's the body learning that
          certain sounds mean unsafety, and refusing to forget."
        </blockquote>
        <p className="text-center font-sans uppercase tracking-[0.18em] text-xs text-foreground/55 mt-3">
          — The Oracle Lover, Editor
        </p>
        <div className="ornament">— § § § —</div>
      </section>

      {lower.length > 0 && (
        <section className="container py-2">
          <div className="rule-double"><p className="section-label text-center">The Columns Below the Fold</p></div>
          <div className="grid md:grid-cols-3 gap-8 mt-6">
            {lower.map((a) => (
              <ArticleCard key={a.slug} size="primary" slug={a.slug} title={a.title} metaDescription={a.metaDescription} category={a.category} heroUrl={a.heroUrl} heroAlt={a.heroAlt} publishedAt={a.publishedAt as unknown as string} />
            ))}
          </div>
        </section>
      )}

      {tail.length > 0 && (
        <section className="container py-10">
          <div className="rule-double"><p className="section-label text-center">Also From the Archive</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-6">
            {tail.map((a) => (
              <ArticleCard key={a.slug} size="secondary" slug={a.slug} title={a.title} metaDescription={a.metaDescription} category={a.category} heroUrl={a.heroUrl} heroAlt={a.heroAlt} publishedAt={a.publishedAt as unknown as string} />
            ))}
          </div>
        </section>
      )}

      <section className="container pb-16 text-center">
        <Link href="/articles" className="ribbon">Walk the full archive</Link>
      </section>
    </div>
  );
}
