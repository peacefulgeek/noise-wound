import { Link } from "wouter";

export type ArticleCardProps = {
  slug: string;
  title: string;
  metaDescription: string;
  category: string;
  heroUrl: string;
  heroAlt?: string;
  publishedAt?: string | Date | null;
  size?: "lead" | "primary" | "secondary" | "tertiary";
};

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export default function ArticleCard({
  slug, title, metaDescription, category, heroUrl, heroAlt, publishedAt, size = "primary",
}: ArticleCardProps) {
  const headlineSize = {
    lead: "text-[clamp(2rem,4.5vw,3.4rem)]",
    primary: "text-[clamp(1.4rem,2.6vw,1.9rem)]",
    secondary: "text-[clamp(1.15rem,2vw,1.4rem)]",
    tertiary: "text-[clamp(1rem,1.6vw,1.15rem)]",
  }[size];

  return (
    <Link href={`/articles/${slug}`} className="article-card group block">
      <article>
        <div className="overflow-hidden rule-thin">
          <img
            src={heroUrl}
            alt={heroAlt ?? title}
            loading="lazy"
            decoding="async"
            className={
              "w-full object-cover photo-aged transition-transform duration-700 group-hover:scale-[1.02] " +
              (size === "lead" ? "aspect-[16/9]" : size === "primary" ? "aspect-[4/3]" : "aspect-[3/2]")
            }
          />
        </div>
        <div className="pt-3">
          <p className="kicker">{category} · {formatDate(publishedAt)}</p>
          <h3 className={`headline mt-1 ${headlineSize}`}>{title}</h3>
          <p className="standfirst mt-2 line-clamp-3">{metaDescription}</p>
        </div>
      </article>
    </Link>
  );
}
