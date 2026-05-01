import { Link } from "wouter";

type Assessment = {
  slug: string;
  name: string;
  questions: number;
  blurb: string;
  source: string;
};

const ASSESSMENTS: Assessment[] = [
  {
    slug: "miso-quotient-25",
    name: "The Misophonia Quotient (TNW-25)",
    questions: 25,
    blurb:
      "A house-built 25-item self-rating that maps trigger frequency, intensity, avoidance, and impairment. The closest thing to a 'how bad is mine' score that doesn't pathologise normal annoyance.",
    source: "Adapted in part from the Amsterdam Misophonia Scale and the MisoQuest.",
  },
  {
    slug: "miso-quest-14",
    name: "MisoQuest (14-item)",
    questions: 14,
    blurb:
      "A short clinical screen by Siepsiak et al. (2020). Useful first triage if you suspect misophonia but haven't been diagnosed.",
    source: "Siepsiak et al., 2020 (Polish Misophonia Group).",
  },
  {
    slug: "amisos-r",
    name: "Amsterdam Misophonia Scale-Revised (A-MISO-S)",
    questions: 6,
    blurb:
      "The Schroder original, six items, severity-only. Used in most clinical research. Doesn't capture impairment well; pair with a longer instrument.",
    source: "Schroder, Vulink, Denys, 2013.",
  },
  {
    slug: "miso-impact-scale",
    name: "Misophonia Impact Questionnaire (MIQ-15)",
    questions: 15,
    blurb:
      "Assesses how much misophonia is actually disrupting work, relationships, sleep, and self-image — not just the trigger count.",
    source: "Adapted from the MIQ family of impact instruments.",
  },
  {
    slug: "trigger-inventory-50",
    name: "The Long Trigger Inventory (50-item)",
    questions: 50,
    blurb:
      "A long, slow inventory of 50 specific sounds and visuals. Use it to map your own profile rather than to score severity.",
    source: "House-built, drawing on Wu, Lewin, Murphy, Storch (2014).",
  },
  {
    slug: "sensory-profile-quick",
    name: "Adult Sensory Profile (Quick Version)",
    questions: 18,
    blurb:
      "Sensory-modulation screen — sensory-seeking, sensory-avoiding, low registration, sensory-sensitivity quadrants. Useful when misophonia overlaps with broader sensory difference.",
    source: "Adapted from Brown & Dunn (2002).",
  },
  {
    slug: "phq-9",
    name: "PHQ-9 (Mood)",
    questions: 9,
    blurb:
      "Standard depression screen. Misophonia + chronic depression is common. Worth knowing your floor.",
    source: "Kroenke et al. (2001), public domain.",
  },
  {
    slug: "gad-7",
    name: "GAD-7 (Anxiety)",
    questions: 7,
    blurb:
      "Generalised anxiety screen. Anxiety amplifies misophonic startle; this baseline is worth tracking.",
    source: "Spitzer et al. (2006), public domain.",
  },
  {
    slug: "isi-7",
    name: "Insomnia Severity Index (ISI)",
    questions: 7,
    blurb:
      "Sleep quality and onset latency. If your partner's breathing wakes you at 3am, the ISI captures the size of that problem.",
    source: "Bastien et al. (2001).",
  },
  {
    slug: "css-6",
    name: "Catastrophic Cognitions Scale (Sound) — 6 items",
    questions: 6,
    blurb:
      "Measures the catastrophic-thinking patterns that turn a chewing sound into 'I cannot bear another second of my life.' Highly responsive to CBT.",
    source: "House-built, modelled on the Pain Catastrophising Scale.",
  },
  {
    slug: "self-compassion-12",
    name: "Self-Compassion Short-Form (SCS-SF)",
    questions: 12,
    blurb:
      "Self-compassion is the single most underrated protective factor in the misophonia literature. Rate yours.",
    source: "Raes, Pommier, Neff & Van Gucht (2011).",
  },
];

export default function Assessments() {
  const total = ASSESSMENTS.reduce((s, a) => s + a.questions, 0);

  return (
    <article className="container py-10 max-w-4xl">
      <header className="mb-8 border-b-4 border-double border-ink/40 pb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-ink/60">The Self-Assessments</p>
        <h1 className="font-masthead text-5xl md:text-6xl leading-none mt-2">
          Eleven Honest Mirrors
        </h1>
        <p className="mt-3 text-ink/70 italic">
          {ASSESSMENTS.length} questionnaires, {total} questions total. Together they
          give you a snapshot of where misophonia, sleep, mood, anxiety, and sensory
          profile sit in your nervous system right now. Take them slowly. They're for
          you, not for a chart.
        </p>
      </header>

      <aside className="rounded border border-ink/20 bg-parchment-2 p-5 mb-10 text-sm leading-relaxed">
        <p>
          These instruments are educational, not diagnostic. None of them replaces
          assessment by a qualified clinician. If your scores frighten you, please
          show them to someone trained — a psychologist, an audiologist, a misophonia
          specialist. Read our <Link href="/disclaimer" className="underline">disclaimer</Link>.
        </p>
      </aside>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ASSESSMENTS.map((a, i) => (
          <li
            key={a.slug}
            className="border border-ink/20 bg-parchment p-5 rounded leading-snug"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-ink/50">
              Mirror №{String(i + 1).padStart(2, "0")} · {a.questions} questions
            </p>
            <h2 className="font-masthead text-xl mt-1 mb-2">{a.name}</h2>
            <p className="text-sm text-ink/80">{a.blurb}</p>
            <p className="text-xs text-ink/40 italic mt-2">Source: {a.source}</p>
            <p className="mt-3 text-xs">
              <span className="px-2 py-0.5 bg-parchment-2 border border-ink/20 rounded text-ink/70">
                Coming online soon
              </span>
            </p>
          </li>
        ))}
      </ul>

      <footer className="mt-12 border-t-4 border-double border-ink/40 pt-6 text-sm text-ink/60">
        <p>
          The interactive scoring engines are being typeset in production. In the
          meantime, every instrument above is a real, validated (or thoughtfully
          house-built) questionnaire — search the source citation, print it, take it
          on paper, bring it to a clinician.
        </p>
      </footer>
    </article>
  );
}
