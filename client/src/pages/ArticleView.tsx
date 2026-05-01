import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";

const APEX = "https://thenoisewound.com";

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export default function ArticleView() {
  const [, params] = useRoute("/articles/:slug");
  const slug = params?.slug ?? "";
  const { data, isLoading, error } = trpc.articles.bySlug.useQuery({ slug }, { enabled: !!slug });

  const article = data?.article;

  // Sticky TOC headings — pulled from the article body's <h2> nodes after render.
  const [tocItems, setTocItems] = useState<{ id: string; label: string }[]>([]);
  useEffect(() => {
    if (!article) return;
    const t = setTimeout(() => {
      const root = document.querySelector(".article-body");
      if (!root) return;
      const items: { id: string; label: string }[] = [];
      root.querySelectorAll("h2").forEach((h, i) => {
        const id = h.id || `section-${i + 1}`;
        h.id = id;
        items.push({ id, label: h.textContent ?? `Section ${i + 1}` });
      });
      setTocItems(items);
    }, 0);
    return () => clearTimeout(t);
  }, [article?.slug, article?.body]);

  const canonical = useMemo(() => `${APEX}/articles/${slug}`, [slug]);

  useEffect(() => {
    if (!article) return;
    document.title = `${article.title} — The Noise Wound`;
    setMeta("description", article.metaDescription);
    setLink("canonical", canonical);
    setMeta("og:title", article.title, "property");
    setMeta("og:description", article.metaDescription, "property");
    setMeta("og:image", article.heroUrl, "property");
    setMeta("og:type", "article", "property");
    setMeta("og:url", canonical, "property");
    setMeta("twitter:card", "summary_large_image");
  }, [article, canonical]);

  if (isLoading) {
    return (
      <div className="container py-20 text-center font-serif italic text-foreground/60">
        Loading the column…
      </div>
    );
  }
  if (error || !article) {
    return (
      <div className="container py-20">
        <h1 className="masthead text-3xl">This column could not be found.</h1>
        <p className="font-serif italic text-foreground/70 mt-3">
          The piece may have been retired or is still in the queue. Try{" "}
          <Link href="/articles" className="underline">the archive</Link> instead.
        </p>
      </div>
    );
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    image: [article.heroUrl],
    datePublished: article.publishedAt
      ? new Date(article.publishedAt as unknown as string).toISOString()
      : undefined,
    dateModified: new Date(article.lastModifiedAt as unknown as string).toISOString(),
    author: { "@type": "Person", name: "The Oracle Lover", url: `${APEX}/author/the-oracle-lover` },
    publisher: {
      "@type": "Organization",
      name: "The Noise Wound",
      logo: { "@type": "ImageObject", url: `${APEX}/favicon.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    inLanguage: "en",
    articleSection: article.category,
    keywords: (article.tags as unknown as string[]).join(", "),
    wordCount: article.wordCount,
    isAccessibleForFree: true,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Front page", item: `${APEX}/` },
      { "@type": "ListItem", position: 2, name: "Archive", item: `${APEX}/articles` },
      { "@type": "ListItem", position: 3, name: article.title, item: canonical },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <article className="container py-10">
        <p className="section-label">{article.category}</p>
        <h1 className="masthead text-[clamp(2.5rem,5.4vw,4.6rem)] leading-[0.95] mt-2 max-w-4xl">
          {article.title}
        </h1>
        <p className="font-serif italic text-foreground/70 text-xl mt-4 max-w-3xl">
          {article.metaDescription}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-sans uppercase tracking-[0.16em] text-foreground/65">
          <span>By <Link href="/author/the-oracle-lover" className="underline">The Oracle Lover</Link></span>
          <span>·</span>
          <time dateTime={(article.publishedAt as unknown as string) ?? undefined}>
            Published {formatDate(article.publishedAt as unknown as string)}
          </time>
          <span>·</span>
          <time dateTime={(article.lastModifiedAt as unknown as string) ?? undefined}>
            Updated {formatDate(article.lastModifiedAt as unknown as string)}
          </time>
          <span>·</span>
          <span>{article.readingTime} min read</span>
          <span>·</span>
          <span>{article.wordCount.toLocaleString()} words</span>
        </div>

        <figure className="mt-8">
          <img
            src={article.heroUrl}
            alt={article.heroAlt ?? article.title}
            loading="eager"
            decoding="async"
            className="w-full aspect-[16/9] object-cover photo-aged frame-deckled"
          />
        </figure>

        <div className="grid lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_220px] gap-10 mt-10">
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <p className="section-label mb-3">In this column</p>
              <nav className="toc-list">
                {tocItems.map((t) => (
                  <a key={t.id} href={`#${t.id}`}>{t.label}</a>
                ))}
              </nav>
              <div className="ornament">— § —</div>
              <p className="font-sans text-xs uppercase tracking-[0.18em] text-foreground/55">
                Filed under
              </p>
              <p className="font-serif italic text-sm mt-1">{article.category}</p>
            </div>
          </aside>

          <div className="article-body max-w-[68ch]" dangerouslySetInnerHTML={{ __html: article.body }} />

          <aside className="hidden xl:block">
            <div className="sticky top-8">
              <p className="section-label mb-3">From the archive</p>
              <ul className="space-y-3 font-serif text-sm">
                <li><Link href="/articles" className="hover:text-[var(--rust)]">Walk the full broadsheet</Link></li>
                <li><Link href="/recommended" className="hover:text-[var(--rust)]">The recommended quiet kit</Link></li>
                <li><Link href="/about" className="hover:text-[var(--rust)]">Editorial stance</Link></li>
              </ul>
              <div className="ornament">— § —</div>
              <p className="font-serif italic text-foreground/65 text-sm">
                "The chewing isn't the wound. The not-being-believed is the wound."
              </p>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}

function setMeta(name: string, value: string, attr: "name" | "property" = "name") {
  if (!value) return;
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}
