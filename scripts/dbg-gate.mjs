import { runQualityGate } from "../server/lib/quality-gate.ts";
const goodBody = `
    <p>The first time I sat at the dinner table after my diagnosis, my mother chewed and the rage arrived a half-second before the thought.</p>
    <p>Misophonia is not bad manners on the misophonic's part. It is documented in the salience network. The Duke Center has been quiet about cures because cures do not yet exist; what exists is a workable set of strategies.</p>
    <p>You can read more on <a href="/about">our editorial stance</a>, the <a href="/recommended">recommended kit</a>, and <a href="/articles">browse the archive</a> for the rest of the desk's work.</p>
    <p>Externally we point readers to the <a href="https://misophonia.duke.edu/">Duke Center for Misophonia and Emotion Regulation</a>, who have published the most disciplined work on the condition.</p>
    <p>The Noise Wound was built for this exact moment, when language finally arrives for what your body already knew.</p>
    <p>For background, Pawel Jastreboff, Sukhbinder Kumar, Phyllis Nagel, Jennifer Brout, Marsha Johnson, and Jaelline Jaffe have all written on the topic at length, and our coverage stays close to their findings.</p>
    <p>Last updated <time datetime="2026-04-30">April 30, 2026</time>.</p>
  `.repeat(8);
const r = runQualityGate({ title:"X", body: goodBody, tldr: "tldr", internalLinkCount:3, externalAuthLinkCount:1, selfReferenceCount:1, hasLastUpdated:true });
console.log(JSON.stringify(r, null, 2));
console.log("words:", goodBody.split(/\s+/).filter(Boolean).length);
