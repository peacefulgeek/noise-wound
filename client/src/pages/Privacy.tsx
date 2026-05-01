export default function Privacy() {
  return (
    <article className="container py-10 max-w-3xl prose prose-stone">
      <header className="mb-8 border-b-4 border-double border-ink/40 pb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-ink/60 not-prose">
          Privacy & Data
        </p>
        <h1 className="font-masthead text-5xl md:text-6xl leading-none mt-2">
          Privacy Policy
        </h1>
        <p className="mt-3 text-ink/70 italic not-prose">
          What we collect, what we don't, and what we'd never do with it.
        </p>
      </header>

      <p><em>Last updated: 1 May 2026.</em></p>

      <h2>The short version</h2>
      <p>
        The Noise Wound is a small editorial site. We collect as little about you as
        we can while still keeping the lights on. We do not sell your data. We do not
        use Google Analytics. We do not use Facebook pixels. We do not run third-party
        retargeting. We do not use Cloudflare. We do not use any Manus-runtime data
        services. We do not use any AI vendor's data telemetry on you.
      </p>

      <h2>What we collect when you visit</h2>
      <ul>
        <li>
          <strong>Standard server logs</strong> — IP address, user agent, page
          requested, timestamp. Stored for 30 days at most for spam and abuse triage,
          then aged out.
        </li>
        <li>
          <strong>Aggregate, anonymous analytics</strong> — page-view counts and
          referrer hostname, processed on our own server and not shared with third
          parties.
        </li>
        <li>
          <strong>Functional cookies</strong> — only if you sign in for editorial
          features (currently none are exposed publicly). The cookie is signed,
          httpOnly, sameSite, and used solely to keep the session alive.
        </li>
      </ul>

      <h2>What we never collect</h2>
      <ul>
        <li>Health information about you.</li>
        <li>Cross-site browsing history.</li>
        <li>Demographic profiles.</li>
        <li>Anything we'd be embarrassed to show your therapist.</li>
      </ul>

      <h2>Affiliate links and Amazon</h2>
      <p>
        When you click an Amazon link from this site, Amazon places its own cookies in
        your browser to attribute any purchase to our affiliate tag
        <code> spankyspinola-20</code>. That cookie behaviour is governed by Amazon's
        privacy policy, not ours. We never see your purchase details — only an
        aggregate commission summary.
      </p>

      <h2>Email</h2>
      <p>
        If a future newsletter is added, it will use Nodemailer over an SMTP relay we
        operate. We will not use Mailchimp, Substack, ConvertKit, or any other
        email-as-a-service provider that builds a behavioural profile of you. Sign-up
        is opt-in only; one-click unsubscribe will always work.
      </p>

      <h2>Children</h2>
      <p>
        The Noise Wound is intended for adult readers. We do not knowingly collect
        information from anyone under 16.
      </p>

      <h2>Your rights</h2>
      <p>
        If you are in the EU/UK/CA, you have the right to request deletion of any data
        we hold about you. Email the address on the <a href="/about">About</a> page
        and we will action it within 30 days.
      </p>

      <h2>Changes</h2>
      <p>
        Material changes to this policy will be flagged on the front page for at least
        14 days before they take effect.
      </p>
    </article>
  );
}
