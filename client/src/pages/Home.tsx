import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import ArticleCard from "@/components/ArticleCard";

export default function Home() {
  const { data, isLoading } = trpc.articles.list.useQuery({ limit: 30 });
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
  const collageA = rest[0];
  const collageB = rest[1];
  const collageC = rest[2];
  const above = rest.slice(3, 5);
  const middle = rest.slice(5, 8);
  const lower = rest.slice(8, 14);
  const tail = rest.slice(14);

  return (
    <div>
      {/* Cinematic Lead Banner */}
      <section className="container pt-6 pb-2">
        {lead && (
          <Link href={`/articles/${lead.slug}`} className="block hero-banner group">
            <img
              src={lead.heroUrl}
              alt={lead.heroAlt ?? lead.title}
              className="photo-bright transition-transform duration-700 group-hover:scale-[1.015]"
            />
            <div className="overlay" />
            <div className="copy">
              <p className="kicker section-label">{lead.category} · The Lead Story</p>
              <h2 className="masthead text-[clamp(1.7rem,4vw,3.4rem)] leading-[1.05] mt-1 max-w-4xl">
                {lead.title}
              </h2>
              <p className="standfirst font-serif italic mt-2 max-w-3xl line-clamp-2">
                {lead.metaDescription}
              </p>
            </div>
          </Link>
        )}
      </section>

      {/* Collage strip — three more photos */}
      {(collageA || collageB || collageC) && (
        <section className="container py-6">
          <div className="rule-double mb-3"><p className="section-label text-center">In Today's Edition</p></div>
          <div className="collage">
            {collageA && (
              <Link href={`/articles/${collageA.slug}`} className="block group relative">
                <img src={collageA.heroUrl} alt={collageA.heroAlt ?? collageA.title} className="photo-bright transition-transform duration-700 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-parchment/95 via-parchment/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="kicker text-[var(--rust)] uppercase font-sans tracking-[0.16em] text-[0.65rem]">{collageA.category}</p>
                  <p className="masthead text-xl md:text-2xl leading-tight mt-1">{collageA.title}</p>
                </div>
              </Link>
            )}
            {collageB && (
              <Link href={`/articles/${collageB.slug}`} className="block group relative">
                <img src={collageB.heroUrl} alt={collageB.heroAlt ?? collageB.title} className="photo-bright transition-transform duration-700 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-parchment/95 via-parchment/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="masthead text-base md:text-lg leading-tight">{collageB.title}</p>
                </div>
              </Link>
            )}
            {collageC && (
              <Link href={`/articles/${collageC.slug}`} className="block group relative">
                <img src={collageC.heroUrl} alt={collageC.heroAlt ?? collageC.title} className="photo-bright transition-transform duration-700 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-parchment/95 via-parchment/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="masthead text-base md:text-lg leading-tight">{collageC.title}</p>
                </div>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Editor's stand-first + secondary stories */}
      {above.length > 0 && (
        <section className="container pt-4 pb-2">
          <div className="grid lg:grid-cols-3 gap-8">
            <aside className="lg:col-span-1 lg:border-r lg:border-foreground/30 lg:pr-8">
              <p className="section-label">From the desk</p>
              <h3 className="masthead text-2xl leading-tight mt-2">
                The chewing isn't the wound. The not-being-believed is the wound.
              </h3>
              <p className="font-serif italic text-foreground/70 mt-3">
                This is a misophonia broadsheet, not a wellness blog. We take the
                salience network seriously, the dinner table seriously, and the
                quiet hour seriously.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/about" className="ribbon">Read our stance</Link>
                <Link href="/herbs" className="ribbon" style={{ background: "var(--steel)" }}>The Apothecary</Link>
                <Link href="/assessments" className="ribbon" style={{ background: "var(--ink)" }}>The Mirrors</Link>
              </div>
            </aside>
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
              {above.map((a) => (
                <ArticleCard key={a.slug} size="primary" slug={a.slug} title={a.title} metaDescription={a.metaDescription} category={a.category} heroUrl={a.heroUrl} heroAlt={a.heroAlt} publishedAt={a.publishedAt as unknown as string} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Today's columns */}
      {middle.length > 0 && (
        <section className="container pt-10 pb-2">
          <div className="rule-double"><p className="section-label text-center">Today's Columns</p></div>
          <div className="grid md:grid-cols-3 gap-8 mt-6">
            {middle.map((a) => (
              <ArticleCard key={a.slug} size="primary" slug={a.slug} title={a.title} metaDescription={a.metaDescription} category={a.category} heroUrl={a.heroUrl} heroAlt={a.heroAlt} publishedAt={a.publishedAt as unknown as string} />
            ))}
          </div>
        </section>
      )}

      {/* Editor's pull-quote */}
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

      {/* Below the fold */}
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

      {/* Archive tail */}
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

      <section className="container pb-16 text-center flex flex-wrap gap-3 justify-center">
        <Link href="/articles" className="ribbon">Walk the full archive</Link>
        <Link href="/herbs" className="ribbon" style={{ background: "var(--steel)" }}>Browse the apothecary</Link>
        <Link href="/assessments" className="ribbon" style={{ background: "var(--ink)" }}>Take a self-assessment</Link>
      </section>
    </div>
  );
}
