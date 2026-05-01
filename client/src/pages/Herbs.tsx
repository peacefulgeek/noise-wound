import { Link } from "wouter";
import { HERBS, asLink, type Herb } from "@/data/herbs";

const groupOrder = [
  "Calm focus",
  "Calm",
  "Mineral baseline",
  "Mineral",
  "Adaptogen",
  "Mushroom",
  "Herb tea",
  "Tea",
  "Tincture",
  "Sleep",
  "Sleep onset",
  "Mood",
  "Mood/sleep",
  "Catecholamine",
  "Glutamate modulation",
  "Methylation",
  "Methylation/mood",
  "B-vitamins",
  "Omega-3",
  "Phospholipid",
  "Vitamin",
  "Multi",
  "TCM sleep",
  "TCM tonic",
  "TCM Liver Qi",
  "TCM heavy-anchor",
  "TCM yin-restoring",
  "TCM shen-calming",
  "TCM bridge",
  "TCM heart-yin",
  "Aromatherapy",
  "Functional food",
  "Fat",
  "Flower essence",
  "Glandular",
  "Calm formula",
  "Herb",
  "—",
];

function group(arr: Herb[]) {
  const m = new Map<string, Herb[]>();
  for (const h of arr) {
    if (!m.has(h.category)) m.set(h.category, []);
    m.get(h.category)!.push(h);
  }
  // Order map by groupOrder
  const out: { name: string; items: Herb[] }[] = [];
  for (const k of groupOrder) {
    if (m.has(k)) {
      out.push({ name: k, items: m.get(k)! });
      m.delete(k);
    }
  }
  m.forEach((v, k) => out.push({ name: k, items: v }));
  return out;
}

export default function Herbs() {
  const grouped = group(HERBS.filter((h) => h.category !== "—"));
  const total = grouped.reduce((s, g) => s + g.items.length, 0);

  return (
    <article className="container py-10 max-w-5xl">
      <header className="mb-8 border-b-4 border-double border-ink/40 pb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-ink/60">The Apothecary</p>
        <h1 className="font-masthead text-5xl md:text-6xl leading-none mt-2">
          The Quiet Apothecary
        </h1>
        <p className="mt-3 text-ink/70 italic">
          {total} hand-vetted herbs, supplements, and TCM formulas — chosen for the
          misophonic nervous system. Every link below uses the
          {" "}
          <code className="px-1 bg-parchment-2 rounded">spankyspinola-20</code>{" "}
          Amazon affiliate tag, which means a small portion of any purchase helps fund
          this archive at no extra cost to you.
        </p>
      </header>

      <aside className="rounded border border-ink/20 bg-parchment-2 p-5 mb-10 text-sm leading-relaxed">
        <p className="font-semibold mb-2">Read this before you click anything below.</p>
        <p>
          I am not a doctor. The Noise Wound is journalism and lived experience, not
          medical advice. Herbs and supplements interact with prescription medications,
          pregnancy, autoimmune conditions, and surgical schedules. Please consult a
          qualified clinician — ideally one who reads both Western pharmacology and TCM
          — before starting anything here. By following any link below you acknowledge
          that the operator of this site bears no liability for outcomes related to your
          use of these products. See our{" "}
          <Link href="/disclaimer" className="underline">full disclaimer</Link>.
        </p>
      </aside>

      <div className="space-y-12">
        {grouped.map((g) => (
          <section key={g.name}>
            <h2 className="font-masthead text-2xl md:text-3xl mb-4 border-b border-ink/20 pb-2">
              {g.name}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {g.items.map((h) => (
                <li key={h.asin} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <a
                      href={asLink(h.asin)}
                      rel="sponsored noopener nofollow"
                      target="_blank"
                      className="font-semibold underline decoration-steel/40 hover:decoration-steel"
                    >
                      {h.brand} — {h.product}
                    </a>
                    <p className="text-sm text-ink/70 mt-1 leading-snug">{h.rationale}</p>
                    <p className="text-xs text-ink/40 mt-1">
                      ASIN {h.asin} · (paid link)
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <footer className="mt-12 border-t-4 border-double border-ink/40 pt-6 text-sm text-ink/60">
        <p>
          As an Amazon Associate this site earns from qualifying purchases. Pricing,
          availability, and formulation can change without notice — please verify on
          Amazon before purchase. Nothing on this page constitutes medical advice.
        </p>
      </footer>
    </article>
  );
}
