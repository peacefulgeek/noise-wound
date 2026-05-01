import { Link } from "wouter";

const KIT: { name: string; asin: string; blurb: string; bunnyImg: string }[] = [
  {
    name: "Loop Quiet 2 Plus reusable earplugs",
    asin: "B0CW1J9KJG",
    blurb: "Soft, low-profile, and the only earplug we've found that survives a long meeting without making your ear canal ache.",
    bunnyImg: "https://noise-wound-images.b-cdn.net/library/lib-30.webp",
  },
  {
    name: "Sony WH-1000XM5 noise-cancelling headphones",
    asin: "B09XS7JWHH",
    blurb: "The strongest active noise cancellation on the market. The dinner-table chewing trigger meets its match here.",
    bunnyImg: "https://noise-wound-images.b-cdn.net/library/lib-31.webp",
  },
  {
    name: "Bose QuietComfort Earbuds II",
    asin: "B0B96V3VGZ",
    blurb: "When over-ear headphones aren't socially viable. The seal is what does the work.",
    bunnyImg: "https://noise-wound-images.b-cdn.net/library/lib-32.webp",
  },
  {
    name: "Lectrofan Classic white-noise machine",
    asin: "B00MQGZRKQ",
    blurb: "Mechanical-style white noise that masks chewing and sniffing without the lullaby quality of nature sounds.",
    bunnyImg: "https://noise-wound-images.b-cdn.net/library/lib-33.webp",
  },
  {
    name: "MPOW silicone soft earplugs (24 pair)",
    asin: "B07K3D7FWS",
    blurb: "For nights when the partner's breathing is the trigger. Mouldable, washable, kind to the canal.",
    bunnyImg: "https://noise-wound-images.b-cdn.net/library/lib-34.webp",
  },
  {
    name: "Bose Sleepbuds II (refurbished)",
    asin: "B08KYKPV8C",
    blurb: "Tiny in-ear masking buds designed for sleep, with a curated soundscape library. Out of production but still findable.",
    bunnyImg: "https://noise-wound-images.b-cdn.net/library/lib-35.webp",
  },
];

export default function Recommended() {
  return (
    <div className="container py-10">
      <p className="section-label">The recommended quiet kit</p>
      <h1 className="masthead text-[clamp(2.4rem,5vw,4rem)] mt-3 leading-[0.95]">
        The shortlist of things that have actually helped.
      </h1>
      <p className="font-serif italic text-foreground/70 text-lg mt-3 max-w-2xl">
        Every product on this list has been used by the desk for at least three
        months. Amazon links carry the affiliate tag <code className="font-sans text-sm bg-[oklch(0.92_0.025_75)] px-1 rounded">spankyspinola-20</code>{" "}
        — buying through them helps keep the broadsheet on its presses.
      </p>

      <div className="ornament">— § —</div>

      <div className="grid md:grid-cols-2 gap-10 mt-6">
        {KIT.map((k) => {
          const url = `https://www.amazon.com/dp/${k.asin}?tag=spankyspinola-20`;
          return (
            <article key={k.asin} className="rule-thin pb-8">
              <div className="overflow-hidden">
                <img
                  src={k.bunnyImg}
                  alt={k.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-[4/3] object-cover photo-aged"
                />
              </div>
              <p className="kicker mt-3">For the misophonic kit</p>
              <h2 className="masthead text-2xl leading-tight mt-1">{k.name}</h2>
              <p className="font-serif italic text-foreground/70 mt-2">{k.blurb}</p>
              <a
                href={url}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="ribbon mt-4 inline-block"
              >
                See on Amazon (paid link)
              </a>
            </article>
          );
        })}
      </div>

      <div className="ornament mt-12">— § § § —</div>
      <p className="text-center font-serif italic text-foreground/65">
        Looking for the editorial stance behind these picks? Read{" "}
        <Link href="/about" className="underline">about the desk</Link>.
      </p>
    </div>
  );
}
