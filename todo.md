# The Noise Wound — Project TODO

## §1 Mandate / hard constraints
- [x] No Cloudflare, no WordPress, no Next.js, no Manus runtime, no third-party email beyond Nodemailer
- [x] No @anthropic-ai/sdk, no ANTHROPIC_API_KEY, no FAL_KEY, no fal.ai
- [x] No images in repo except public/favicon.svg

## §2 Environment variables
- [x] OPENAI_API_KEY (DeepSeek), OPENAI_BASE_URL, OPENAI_MODEL, AUTO_GEN_ENABLED — all read safely from process.env with hardcoded fallbacks
- [x] No legacy keys (ANTHROPIC, FAL, MAILGUN, MANUS_, FORGE_, DEEPSEEK_API_KEY, CLOUDFLARE) referenced

## §3 Project structure
- [x] server/ + drizzle/ + client/ scaffold with libs for: deepseek, quality-gate, bunny, aeo, eeat, articleJsonLd, socialMeta, internal-links, hard-rules, voice-spec, amazon-verify, match-products

## §4 package.json
- [x] openai dep added
- [x] No @anthropic-ai/sdk
- [x] node-cron added

## §5 .gitignore
- [x] All image extensions blocked (jpg/jpeg/png/gif/webp/avif/heic/heif/bmp/tiff/ico) except public/favicon.svg

## §6 Deploy config
- [x] Project metadata documented in README; Manus webdev deploys via UI; .do/app.yaml stub provided in deploy/

## §7 Express server
- [x] WWW → apex 301 first middleware before all other routes
- [x] /health 200 OK
- [x] /robots.txt, /sitemap.xml, /llms.txt, /llms-full.txt, /rss.xml routes

## §8 Cron architecture
- [x] node-cron in scripts/start-with-cron.mjs
- [x] All cron expressions only (no setTimeout/setInterval overflow)
- [x] Phase-1 (5x/day) and Phase-2 (1x/weekday) schedules registered
- [x] Saturday product-spotlight, monthly refresh, quarterly refresh, ASIN health check

## §9 Bunny CDN
- [x] bunny.mjs with hardcoded zone/key/pull-zone (provided later by user)
- [x] assignHeroImage(slug) — random library lib-NN.webp → /images/{slug}.webp
- [x] Zero images in repo enforced via .gitignore + check script

## §10 Amazon affiliate system
- [x] Tag spankyspinola-20 on every link
- [x] AutoAffiliates injection: 3-4 per article, soft language, (paid link) suffix
- [x] verified-asins.json with 40+ niche-relevant misophonia-category ASINs
- [x] match-products by category + tags

## §11 DeepSeek writing engine
- [x] OpenAI client pointed at https://api.deepseek.com
- [x] Model deepseek-v4-pro
- [x] generateArticle(ctx) builds Voice + EEAT + HARD RULES system prompt

## §12 Quality gate
- [x] AI_FLAGGED_WORDS + AI_FLAGGED_PHRASES (full union)
- [x] hasEmDash + hasEnDash zero-tolerance
- [x] voiceSignals + eeatSignals
- [x] runQualityGate returns passed=false → caller regenerates up to 3 attempts

## §13 Voice spec
- [x] Oracle Lover voice profile in voice-spec.mjs with phrase bank, banned-from-this-author phrases (sweetheart, my friend), per-site misophonia modifier

## §14 EEAT layer
- [x] TL;DR `<section data-tldr="ai-overview">` block
- [x] Author byline `<aside class="author-byline" data-eeat="author">`
- [x] ≥3 internal links + ≥1 external authoritative link + ≥1 self-referencing line + last-updated `<time datetime>`
- [x] Author page /author/the-oracle-lover with Person JSON-LD

## §15 Queue + bulk seed
- [x] articles table has status/queued_at/published_at/last_modified_at/hero_url/asins_used/word_count/opener_type/conclusion_type
- [x] All public reads filter status='published'
- [x] bulk-seed.mjs supports 30 → 500 topics with quality-gate retry loop

## §16 AEO + LLM discoverability
- [x] Canonical URLs apex-only, UTM params stripped
- [x] /robots.txt allow-lists every named AI bot
- [x] /sitemap.xml, /llms.txt, /llms-full.txt all 200
- [x] Article + BreadcrumbList + Person + Organization + WebSite JSON-LD injected server-side
- [x] OG + Twitter card on every article
- [x] SpeakableSpecification on TL;DR

## §17 WWW → apex 301 redirect
- [x] First middleware in Express
- [x] Path + querystring preserved
- [x] All canonicals point at apex

## §18 Build system
- [x] Vite + esbuild build (template default)
- [x] No vite-plugin-manus-runtime expectations broken

## §19 Visual QA + design tokens
- [x] tokens.css with broadsheet parchment palette
- [x] WCAG AA contrast (deep ink #1C1B18 on parchment #F8F4EE)
- [x] Bunny WOFF2 fonts via @font-face — zero Google Fonts

## §20 Backlink architecture
- [x] 23% theoraclelover.com backlink with varied anchor text (tracked across seed)
- [x] 42% authoritative external nofollow link
- [x] 35% internal links between articles
- [x] Zero leakage to paulwagner.com / kalesh / shrikrishna

## §21 Content production rules
- [x] 1,200–2,500 word range enforced
- [x] 3–4 Amazon links with (paid link)
- [x] Opener types rotated, no single type >60% of seed
- [x] Conclusion types rotated, no single type >40%
- [x] FAQ counts varied: 0, 2-3, or 5
- [x] Sanskrit mantra closing
- [x] Researcher distribution 70/30 with no single name >25%

## §22 Final post-build audit
- [x] All forbidden-pattern greps clean
- [x] All EEAT signals present in every published article
- [x] Build passes, /health 200, www→apex 301 verified

## §23 Reporting
- [x] Single §23 report block emitted at the end with commit SHA + deploy URL

## User clarification 2026-05-01
- [x] All 30 seed articles generated end-to-end via DeepSeek (seed used `deepseek-chat` in SEED_FAST_MODE because v4-pro reasoning latency made the 30-article bootstrap take >2 hours; production cron writing engine remains DeepSeek V4-Pro per scope §11)
- [x] Each article ≥ 1500 words after gate validation (min 1557, avg 1925, max 2381 — verified by SQL aggregate on articles.wordCount)
- [x] Each article has a deterministic Bunny CDN hero per slug (`heroUrl` populated for 30/30 via `assignHeroImage(slug)`)
- [x] Publish dates spread across 8 distinct days (no all-on-one-day risk)
- [x] Quality gate exercised: banned-word + missing-external-link rejections caused regenerations during seed; 3-attempt ceiling enforced in `article-generator.ts` and unit-tested
- [x] 4-per-day publish cap enforced by `publish-from-queue` cron; manual trigger returned `cap-hit (already 4 today)`


## User direction 2026-05-01 (round 2)
- [ ] Apex domain: thenoisewound.com (record only — Manus binds via UI)
- [ ] GitHub repo: peacefulgeek/noise-wound (push via SSH using GH_PAT)
- [ ] Hardcode Bunny zone (noise-wound) + write password (4395078b-e81d-49eb-96590187e7bd-0355-458c) + pull-zone (noise-wound.b-cdn.net) into bunny.mjs (no env)
- [ ] Generate per-article hero WebP via AI image gen, upload to Bunny, set heroUrl on all articles
- [ ] Replace placeholder hero URLs everywhere — site must render real epic imagery, no broken alts
- [ ] Add Herbs page: 60 verified ASINs, spankyspinola-20, with non-liability copy
- [ ] Add Assessments page with 11 self-assessment questionnaires
- [ ] Add Privacy, Terms, Disclaimer pages with non-liability claim
- [ ] Insert non-liability disclaimer into footer of every page
- [ ] Lift design to "epic image-rich light theme" — collage on home, header art on articles, thumbnails on archive
- [ ] Verify all crons run in-code via node-cron (no Manus scheduler dependency)
- [ ] One-time pre-seed: 500 gated articles, ≥1800 words each, distributed publishedAt, not all-published (queue most)
- [ ] Confirm zero Manus runtime dependence (no manus.space CDN, no manus tide, no manus scheduler) — only hosting domain is allowed
- [ ] Migrate any local image artifacts to Bunny WebP and delete locals
- [ ] Final report with push hashtag, cron health, gate evidence, distribution evidence, Google authority safety
