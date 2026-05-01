import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import ArticleCard from "@/components/ArticleCard";

export default function Author() {
  const { data } = trpc.articles.list.useQuery({ limit: 12 });
  const articles = data?.articles ?? [];

  return (
    <article className="container py-10 max-w-5xl">
      <p className="section-label">The editor</p>
      <h1 className="masthead text-[clamp(2.5rem,5vw,4rem)] mt-3 leading-[0.95]">
        The Oracle Lover
      </h1>
      <p className="font-serif italic text-foreground/70 text-xl mt-4 max-w-2xl">
        Editor of The Noise Wound. Writes about misophonia, sound sensitivity,
        the salience network, and the lived exhaustion of being asked to just
        relax.
      </p>

      <div className="ornament">— § —</div>

      <section className="article-body max-w-3xl">
        <p>
          The Oracle Lover writes about the body's response to sound the way a
          medic writes about the body's response to bleeding: precisely, without
          flinching, and without ever pretending the wound isn't real. The
          column you are reading is the only desk that takes misophonia
          seriously enough to dignify the chewing trigger with neuroscience
          instead of advice.
        </p>
        <p>
          Read{" "}
          <Link href="/about" className="underline">
            the editorial stance
          </Link>
          , walk{" "}
          <Link href="/articles" className="underline">
            the archive
          </Link>
          , or browse{" "}
          <Link href="/recommended" className="underline">
            the recommended quiet kit
          </Link>
          .
        </p>
      </section>

      <div className="ornament mt-12">— § § § —</div>

      <h2 className="masthead text-3xl mt-8">By the same hand</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
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
    </article>
  );
}
