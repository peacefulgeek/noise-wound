import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Mail, Rss, BookOpen } from "lucide-react";

const NAV: { href: string; label: string; kicker?: string }[] = [
  { href: "/", label: "The Front Page", kicker: "Today" },
  { href: "/articles", label: "The Archive", kicker: "All editions" },
  { href: "/recommended", label: "The Quiet Kit", kicker: "Recommended" },
  { href: "/about", label: "About the Desk", kicker: "Our stance" },
  { href: "/author/the-oracle-lover", label: "The Editor", kicker: "By the same hand" },
];

export default function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    setOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Masthead */}
      <header className="border-b-2 border-foreground/90">
        <div className="container py-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] font-sans text-foreground/70">
          <span>Vol. I — A misophonic broadsheet</span>
          <span className="hidden sm:inline">{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          <span>Late edition</span>
        </div>
        <div className="border-y border-foreground/80 bg-[oklch(0.95_0.02_75)]">
          <div className="container py-3 flex items-center gap-3">
            <button
              type="button"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="-ml-2 p-2 rounded hover:bg-[oklch(0.92_0.025_75)] transition"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link href="/" className="block flex-1 text-center">
              <h1 className="masthead text-[clamp(2.6rem,7vw,5.5rem)] leading-none">
                The Noise Wound
              </h1>
              <p className="font-serif italic text-foreground/65 text-sm sm:text-base mt-1">
                The only desk that takes misophonia seriously.
              </p>
            </Link>
            <div className="w-9 hidden sm:block" />
          </div>
        </div>
        <div className="container py-2 flex flex-wrap justify-center items-center gap-x-6 gap-y-1 text-[12px] uppercase tracking-[0.16em] font-sans">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={
                "hover:text-[var(--rust)] transition " +
                (location === n.href ? "text-[var(--rust)] underline underline-offset-4" : "")
              }
            >
              {n.label}
            </Link>
          ))}
        </div>
      </header>

      {/* Drawer */}
      {open && (
        <aside
          className="fixed inset-0 z-40 bg-background/97 border-r border-foreground/40"
          onClick={() => setOpen(false)}
        >
          <div className="container py-10" onClick={(e) => e.stopPropagation()}>
            <button
              aria-label="Close navigation"
              className="mb-6 p-2 -ml-2"
              onClick={() => setOpen(false)}
            >
              <X size={24} />
            </button>
            <p className="section-label mb-2">Navigate</p>
            <nav className="grid gap-3">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="block rule-thin pb-3 group"
                >
                  <p className="kicker text-[var(--rust)] uppercase font-sans tracking-[0.18em] text-xs">
                    {n.kicker}
                  </p>
                  <p className="masthead text-3xl group-hover:text-[var(--rust)] transition">
                    {n.label}
                  </p>
                </Link>
              ))}
            </nav>
            <div className="ornament mt-8">— § § § —</div>
            <p className="font-serif italic text-foreground/70 text-sm">
              "The chewing isn't the wound. The not-being-believed is the wound."
            </p>
          </div>
        </aside>
      )}

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="mt-16 border-t-2 border-foreground/90 bg-[oklch(0.94_0.025_75)]">
        <div className="container py-10 grid gap-8 md:grid-cols-3">
          <div>
            <p className="masthead text-2xl">The Noise Wound</p>
            <p className="font-serif italic text-foreground/70 mt-2">
              A broadsheet for the misophonic — neuroscience, strategies, and
              the lived exhaustion of being asked to just relax.
            </p>
          </div>
          <div>
            <p className="section-label mb-2">The columns</p>
            <ul className="space-y-1 font-sans text-sm">
              <li><Link href="/" className="hover:text-[var(--rust)]">Front page</Link></li>
              <li><Link href="/articles" className="hover:text-[var(--rust)]">Archive</Link></li>
              <li><Link href="/recommended" className="hover:text-[var(--rust)]">Quiet kit</Link></li>
              <li><Link href="/about" className="hover:text-[var(--rust)]">About the desk</Link></li>
              <li><Link href="/author/the-oracle-lover" className="hover:text-[var(--rust)]">The editor</Link></li>
            </ul>
          </div>
          <div>
            <p className="section-label mb-2">Wires</p>
            <ul className="space-y-1 font-sans text-sm">
              <li><a href="/rss.xml" className="inline-flex items-center gap-2 hover:text-[var(--rust)]"><Rss size={14} /> RSS feed</a></li>
              <li><a href="/sitemap.xml" className="inline-flex items-center gap-2 hover:text-[var(--rust)]"><BookOpen size={14} /> Sitemap</a></li>
              <li><a href="/llms.txt" className="inline-flex items-center gap-2 hover:text-[var(--rust)]"><Mail size={14} /> llms.txt</a></li>
            </ul>
            <p className="font-sans text-xs text-foreground/55 mt-4">
              As an Amazon Associate this desk may earn from qualifying
              purchases. Tag: spankyspinola-20.
            </p>
          </div>
        </div>
        <div className="border-t border-foreground/30">
          <div className="container py-3 flex flex-col sm:flex-row justify-between gap-2 text-[11px] font-sans uppercase tracking-[0.18em] text-foreground/60">
            <span>© {new Date().getFullYear()} The Noise Wound</span>
            <span>Set in Merriweather, Source Serif Pro, and Inter.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
