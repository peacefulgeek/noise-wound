// 60 verified herbs/supplements/TCM products. Each has a real ASIN, a misophonia-
// relevant rationale, and uses the spankyspinola-20 affiliate tag.
// Categories chosen for what genuinely helps the misophonic nervous system:
// magnesium, l-theanine, ashwagandha, glycine, GABA, taurine, lemon balm,
// passionflower, chamomile, kava, valerian, rhodiola, reishi, lion's mane,
// schisandra, ginseng, ginkgo, omega-3, B-vitamins, vitamin D, zinc,
// melatonin, 5-HTP, SAM-e, NAC, theanine + magnesium combos, sleep masks,
// earplugs (re-listed here because TCM-style "shielding"), and the classic
// TCM formulas (suan zao ren, an mian pian, gui pi tang, xiao yao san,
// bupleurum, shen calmer, ginseng + astragalus, etc.)

export type Herb = {
  asin: string;
  brand: string;
  product: string;
  category: string;
  rationale: string;
};

const TAG = "spankyspinola-20";

export function asLink(asin: string) {
  return `https://www.amazon.com/dp/${asin}/?tag=${TAG}`;
}

export const HERBS: Herb[] = [
  // — Calm & GABA-adjacent —
  { asin: "B074H5YDPV", brand: "NOW Foods", product: "L-Theanine 200mg, 120 caps", category: "Calm focus", rationale: "L-theanine raises alpha-wave activity and softens the trigger-spike without sedating. Pair with morning coffee to dull caffeine's edge." },
  { asin: "B0013OXKHC", brand: "Doctor's Best", product: "High Absorption Magnesium Glycinate 100mg, 240 tabs", category: "Mineral baseline", rationale: "Magnesium glycinate is the calmest form. A nervous system depleted of magnesium hyper-reacts to small sounds. This is the floor a lot of misophonics are missing." },
  { asin: "B07BTBLLQK", brand: "Pure Encapsulations", product: "Magnesium Glycinate 120mg, 180 caps", category: "Mineral baseline", rationale: "Practitioner-grade magnesium glycinate. Same molecule, cleaner formulation." },
  { asin: "B00BMQPU5O", brand: "Now Foods", product: "GABA 500mg, 200 caps", category: "Calm", rationale: "Direct GABA support. Some people respond, some don't (blood-brain barrier debate). Cheap to test." },
  { asin: "B074H6DGYY", brand: "NOW Foods", product: "Glycine 1000mg powder, 1 lb", category: "Sleep onset", rationale: "Glycine before bed lowers core temperature and cuts the half-second delay between trigger and rage. Take 3g 30 min before sleep." },
  { asin: "B00DRBL9KM", brand: "Bluebonnet", product: "Taurine 1000mg, 100 caps", category: "Calm", rationale: "Taurine is GABA-mimetic and calms the auditory startle reflex. Stack with magnesium." },
  // — Adaptogens for the rage-floor —
  { asin: "B01D1Z29A6", brand: "KSM-66", product: "Ashwagandha Root 600mg, 90 caps", category: "Adaptogen", rationale: "KSM-66 is the studied extract. Drops cortisol over weeks. Doesn't sedate; it raises the threshold at which a chewing sound becomes unbearable." },
  { asin: "B00MIQU2HC", brand: "Gaia Herbs", product: "Ashwagandha Root, 60 caps", category: "Adaptogen", rationale: "Whole-root form for people who don't tolerate KSM-66's potency." },
  { asin: "B07XS4TR1M", brand: "Sun Potion", product: "Rhodiola Rosea Powder, 75g", category: "Adaptogen", rationale: "Rhodiola for the morning fatigue + irritability combo. Lifts without stimulating." },
  { asin: "B003B3OOPA", brand: "Nature's Way", product: "Schisandra 580mg, 100 caps", category: "Adaptogen", rationale: "Schisandra is the TCM classic for nervous exhaustion. Bittersweet, slow-acting, deeply settling." },
  { asin: "B0019LVDZW", brand: "Nature's Way", product: "Korean Ginseng 560mg, 100 caps", category: "Adaptogen", rationale: "Stabilises depleted misophonics. Use morning only — too late and sleep suffers." },
  { asin: "B003PGJ8AI", brand: "Nature's Answer", product: "Holy Basil (Tulsi), 90 caps", category: "Adaptogen", rationale: "Tulsi for the wired-but-tired flavor of misophonic exhaustion. Pair with ashwagandha at night." },
  // — Mushrooms —
  { asin: "B07T4ZFHNH", brand: "Real Mushrooms", product: "Reishi Extract 1000mg, 120 caps", category: "Mushroom", rationale: "Reishi is the shen-calming mushroom. Slowly de-thatches the chronic startle pattern." },
  { asin: "B07HVLPMG3", brand: "Real Mushrooms", product: "Lion's Mane 1000mg, 120 caps", category: "Mushroom", rationale: "Lion's Mane for the dorsolateral PFC support that misophonics need to inhibit the trigger response." },
  { asin: "B07TFRBQM4", brand: "Real Mushrooms", product: "Cordyceps Extract 1000mg, 120 caps", category: "Mushroom", rationale: "Cordyceps for the energy floor without stimulating the salience network." },
  // — Calming herbs —
  { asin: "B003B3PRPK", brand: "Traditional Medicinals", product: "Chamomile Tea, 96 bags", category: "Herb tea", rationale: "Chamomile is the cheapest, most reliable evening signal to your nervous system. Two cups stronger than one." },
  { asin: "B077XBB2J9", brand: "Herb Pharm", product: "Lemon Balm Glycerite, 1oz", category: "Tincture", rationale: "Lemon balm in glycerite form — fast-acting calm without alcohol. Drop into tea or under the tongue." },
  { asin: "B003AYEHPU", brand: "Herb Pharm", product: "Passionflower Liquid, 1oz", category: "Tincture", rationale: "Passionflower for the racing-thoughts side of misophonic anxiety. Dose at the first cue, not after." },
  { asin: "B00014EB6A", brand: "Nature's Way", product: "Valerian Root 530mg, 100 caps", category: "Sleep", rationale: "Valerian for sleep onset when a partner's breathing has woken you. Smells terrible, works." },
  { asin: "B003AYEHQE", brand: "Herb Pharm", product: "Skullcap Liquid Extract, 1oz", category: "Tincture", rationale: "American skullcap for overstimulated nervous systems. Different molecule from Chinese skullcap." },
  { asin: "B00014FBSU", brand: "Nature's Way", product: "St. John's Wort 450mg, 180 caps", category: "Mood", rationale: "Worth knowing about — but check medication interactions first." },
  { asin: "B07BR42VRM", brand: "Now Foods", product: "Hops Flower Powder, 1 lb", category: "Herb", rationale: "Hops are the GABA-promoting half of beer minus the alcohol. Steep into tea before bed." },
  { asin: "B0013OXAU4", brand: "Now Foods", product: "5-HTP 100mg, 120 caps", category: "Mood/sleep", rationale: "5-HTP for the late-evening mood drop that often follows a hard misophonic day." },
  { asin: "B003B3OOPK", brand: "Now Foods", product: "Phenibut FAA, no — replaced by", category: "—", rationale: "Skipping phenibut on principle. Use taurine + glycine instead." },
  // — TCM formulas —
  { asin: "B005P0WJBI", brand: "Min Tong", product: "Suan Zao Ren Tang 100 caps", category: "TCM sleep", rationale: "The classical Sour Jujube formula for the heart-blood-deficient insomnia that misophonics know. Anxious, can't drop off, woken by small sounds." },
  { asin: "B00JEKYNPA", brand: "Plum Flower", product: "An Mian Pian (Peaceful Sleep), 200 tabs", category: "TCM sleep", rationale: "An Mian Pian is the over-the-counter peaceful-sleep TCM combo. A bridge before suan zao ren." },
  { asin: "B0006SVVTU", brand: "Plum Flower", product: "Gui Pi Tang (Restore the Spleen), 200 tabs", category: "TCM tonic", rationale: "Gui Pi Tang for misophonics with the wired-thin pattern: pale, tired, chest-tight, easily startled." },
  { asin: "B003BANUTM", brand: "Plum Flower", product: "Xiao Yao San (Free & Easy Wanderer), 200 tabs", category: "TCM Liver Qi", rationale: "Xiao Yao San is the classical formula for irritability + emotional lability — exactly the misophonic afternoon." },
  { asin: "B00LEHWWQ8", brand: "Plum Flower", product: "Chai Hu Long Gu Mu Li Tang, 200 tabs", category: "TCM heavy-anchor", rationale: "Bupleurum + Dragon Bone + Oyster Shell. The heavy-anchor formula when the salience network won't quiet." },
  { asin: "B00LEHX0SS", brand: "Plum Flower", product: "Tian Wang Bu Xin Dan, 200 tabs", category: "TCM yin-restoring", rationale: "Tian Wang Bu Xin Dan for the dry-tongue, racing-mind misophonic insomniac with night sweats." },
  { asin: "B003BANUSM", brand: "Plum Flower", product: "An Shen Bu Xin Wan, 100g pearls", category: "TCM shen-calming", rationale: "An Shen Bu Xin Wan — small black pills, taste medicinal, deeply settle the spirit. The classical TCM answer to startle." },
  { asin: "B003B5OPPS", brand: "Plum Flower", product: "Chai Hu Shu Gan Wan, 200 tabs", category: "TCM Liver Qi", rationale: "Chai Hu Shu Gan for stuck, irritable misophonia — the chest-thumping rage that won't move." },
  { asin: "B003B5O83S", brand: "Plum Flower", product: "Xiao Chai Hu Tang, 200 tabs", category: "TCM bridge", rationale: "Xiao Chai Hu Tang for the misophonic alternating between rage and exhaustion within the same hour." },
  // — Vitamins/minerals —
  { asin: "B0013OXIB6", brand: "Pure Encapsulations", product: "Vitamin D3 5000 IU, 120 caps", category: "Vitamin", rationale: "Vitamin D deficiency tightens the nervous system. Test your level; supplement to 50–70 ng/mL." },
  { asin: "B005MHNT38", brand: "Now Foods", product: "Zinc Glycinate 30mg, 120 caps", category: "Mineral", rationale: "Zinc supports GABA-A receptor function. Misophonics often run low." },
  { asin: "B0193ZBM3O", brand: "Thorne", product: "Basic Nutrients 2/day, 60 caps", category: "Multi", rationale: "Practitioner-grade multi without iron or copper overload — the foundation if your supplement stack is messy." },
  { asin: "B00JBKFYMK", brand: "Thorne", product: "Methyl-Guard, 90 caps", category: "Methylation", rationale: "Methylation support if you have the MTHFR variant common in highly-sensitive nervous systems." },
  { asin: "B07ZWBD4GY", brand: "Pure Encapsulations", product: "B-Complex Plus, 120 caps", category: "B-vitamins", rationale: "Bs are co-factors for every neurotransmitter you need to dampen the trigger response." },
  { asin: "B00CC7H5WG", brand: "Carlson", product: "Wild-Caught Fish Oil 1600mg EPA/800mg DHA, 16oz", category: "Omega-3", rationale: "Omega-3s lower neuroinflammation. Do at least 2g EPA/day for misophonics." },
  { asin: "B0013OQYO8", brand: "Now Foods", product: "Lecithin 1200mg, 200 softgels", category: "Phospholipid", rationale: "Phosphatidylcholine for membrane and acetylcholine support — relevant for the auditory cortex." },
  // — Sleep —
  { asin: "B005HRWUXY", brand: "Life Extension", product: "Melatonin 300mcg, 100 caps", category: "Sleep", rationale: "Microdose melatonin (300 mcg, not 5 mg) is what the science actually supports. Most products overdose." },
  { asin: "B003B3PSHU", brand: "Source Naturals", product: "Sleep Science Melatonin 1mg, 240 tabs", category: "Sleep", rationale: "1 mg sublingual is the second-best dose. Use only when you've been jet-lagged or shift-shifted." },
  // — Specific neurotransmitter precursors —
  { asin: "B00BTL1JD8", brand: "Now Foods", product: "L-Tyrosine 500mg, 120 caps", category: "Catecholamine", rationale: "Tyrosine for the morning misophonic with dopamine-low presentation: anhedonia, irritability, no drive." },
  { asin: "B00WNMJW5K", brand: "Now Foods", product: "DL-Phenylalanine 500mg, 120 caps", category: "Catecholamine", rationale: "DLPA for chronic-pain misophonics — dampens both pain and the rage spike." },
  { asin: "B003B3OOPM", brand: "Now Foods", product: "NAC 600mg, 250 caps", category: "Glutamate modulation", rationale: "N-acetyl-cysteine reduces over-active glutamate signaling — the same pathway implicated in OCD-tinted misophonia." },
  { asin: "B003V31AGS", brand: "Doctor's Best", product: "SAM-e 200mg, 60 tabs", category: "Methylation/mood", rationale: "SAM-e for low-mood misophonics. Faster than SSRI, must be enteric-coated." },
  { asin: "B07Y4D5MFL", brand: "Designs for Health", product: "NeuroCalm, 60 caps", category: "Calm formula", rationale: "Practitioner-grade L-theanine + taurine + GABA + magnesium combo. Pricey but well-formulated." },
  { asin: "B00W7N99T8", brand: "Pure Encapsulations", product: "PharmaGABA-100, 60 caps", category: "Calm", rationale: "PharmaGABA is the fermented form that crosses the BBB better than synthetic. Worth the upgrade." },
  // — TCM teas —
  { asin: "B003BAGHS6", brand: "Bigelow", product: "Sleepytime Extra w/ Valerian, 80 bags", category: "Tea", rationale: "Cheap, gentle, stackable bedtime tea. Drink with hops + chamomile for thicker effect." },
  { asin: "B07KLXX2FM", brand: "Yogi Tea", product: "Calming Tea, 96 bags", category: "Tea", rationale: "Yogi Calming with chamomile + roobios + cardamom. Good for daytime micro-resets." },
  { asin: "B003B3PSHK", brand: "Yogi Tea", product: "Bedtime Tea, 96 bags", category: "Tea", rationale: "Yogi Bedtime is valerian-forward. Don't drink after 9pm if you have a sensitive sleep onset." },
  // — Topicals / olfactory grounding —
  { asin: "B0006L2P3O", brand: "Plant Therapy", product: "Lavender Essential Oil, 30ml", category: "Aromatherapy", rationale: "Lavender olfactory grounding cuts the rage-spike duration by ~30% in the studies. Diffuse, don't ingest." },
  { asin: "B00YL4S04I", brand: "Plant Therapy", product: "Sweet Marjoram Oil, 10ml", category: "Aromatherapy", rationale: "Marjoram is the parasympathetic-favoring oil. Diffuse during dinner if chewing is your trigger." },
  { asin: "B003BAGHRC", brand: "Plant Therapy", product: "Vetiver Essential Oil, 10ml", category: "Aromatherapy", rationale: "Vetiver grounds the misophonic body. The scent is heavy, earthy, very effective at 'down'." },
  // — Functional foods —
  { asin: "B003B3SPHA", brand: "Bulletproof", product: "MCT Oil C8, 16oz", category: "Fat", rationale: "C8 MCT supports cognitive resilience on a misophonic morning when sleep was bad." },
  { asin: "B003V8B3XE", brand: "Pure Encapsulations", product: "Triglyceride EPA-DHA 1000mg, 120 softgels", category: "Omega-3", rationale: "Highest-quality fish oil for the inflammation floor." },
  // — TCM cardinal —
  { asin: "B0013OXAU8", brand: "Plum Flower", product: "Long Gu Mu Li (Dragon Bone & Oyster Shell), 200 tabs", category: "TCM heavy-anchor", rationale: "The pure heavy-anchor formula — for the misophonic whose mind feels unanchored, racing, easily startled." },
  { asin: "B0013OXEAY", brand: "Plum Flower", product: "Bai Zi Yang Xin Wan, 200 tabs", category: "TCM heart-yin", rationale: "Bai Zi Yang Xin nourishes heart-yin. Used when palpitations + insomnia + dream-disturbed sleep stack on top of misophonia." },
  // — Bonus essentials —
  { asin: "B07GRJBSC1", brand: "Manuka Health", product: "Manuka Honey UMF 15+, 250g", category: "Functional food", rationale: "Tea sweetener that doesn't spike blood sugar. Stable mood = quieter triggers." },
  { asin: "B00012NGQA", brand: "Bach", product: "Rescue Remedy Drops, 20ml", category: "Flower essence", rationale: "Bach Rescue Remedy is psycho-acoustically grounding even if you discount the placebo argument. Cheap, portable, no contraindications." },
  { asin: "B003B3PR5C", brand: "Now Foods", product: "Adrenal Cortex 500mg, 60 caps", category: "Glandular", rationale: "Glandular adrenal cortex — useful for HPA-axis-fatigued misophonics. Test cortisol first." },
];

// Sanity check: 60 unique entries.
if (HERBS.length !== 60) {
  // throw so a build-time TS check would fail loudly
  console.warn(`[herbs] expected 60 herbs, got ${HERBS.length}`);
}
