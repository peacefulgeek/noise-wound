import { Link } from "wouter";

export default function About() {
  return (
    <article className="container py-10 max-w-3xl">
      <p className="section-label">About the desk</p>
      <h1 className="masthead text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] mt-3">
        We take misophonia seriously, even when the world refuses to.
      </h1>
      <p className="font-serif italic text-foreground/70 text-xl mt-4">
        The Noise Wound is a broadsheet, not a wellness blog. We do not say
        breathe. We do not say have you tried meditating. We do not call your
        rage at the chewing irrational.
      </p>

      <div className="ornament">— § —</div>

      <section className="article-body">
        <h2>What this paper is for</h2>
        <p>
          Misophonia is a real, measurable difference in how the salience network
          processes specific sounds. Those of us who live with it have learned to
          smile through dinner and apologise for our nervous systems. This desk
          exists to stop that. We write the article you wish someone had handed
          you the first time the chewing made you cry.
        </p>

        <h2>Editorial method</h2>
        <p>
          Every column is researched against the current peer-reviewed
          literature on misophonia, sound sensitivity, and the autonomic nervous
          system. We name researchers — Sukhbinder Kumar, Pawel Jastreboff, Jane
          Gregory, Jaelline Jaffe, Marsha Johnson — and we cite where to find
          their work. Where we draw on contemplative traditions, we name those
          too. We never invent a study to pad an argument.
        </p>

        <h2>What you will not find here</h2>
        <p>
          You will not find the phrase <em>just relax</em>. You will not find
          unverified Amazon products, cynical affiliate stuffing, or AI prose
          designed to please an algorithm. You will not find references to
          quote-machine wellness influencers we are quietly paid to mention.
        </p>

        <h2>The masthead</h2>
        <p>
          Edited by The Oracle Lover, who has lived with misophonia long enough
          to know it isn't a hatred of sound but a refusal of betrayal. Read
          more from{" "}
          <Link href="/author/the-oracle-lover" className="underline">
            the editor's column
          </Link>{" "}
          or walk{" "}
          <Link href="/articles" className="underline">
            the full archive
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
