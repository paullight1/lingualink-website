import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(
  new URL("../app/(marketing)/page.tsx", import.meta.url),
  "utf8",
);
const nav = await readFile(
  new URL("../components/site/Nav.tsx", import.meta.url),
  "utf8",
);
const footer = await readFile(
  new URL("../components/site/Footer.tsx", import.meta.url),
  "utf8",
);
const about = await readFile(
  new URL("../app/(marketing)/about/page.tsx", import.meta.url),
  "utf8",
);
const logo = await readFile(
  new URL("../components/site/Logo.tsx", import.meta.url),
  "utf8",
);
const source = page + nav + footer + about + logo;

const requiredLandmarks = [
  "Get Started",
  "mx-auto max-w-3xl text-center",
  "MissionIllustration",
  "Feature Showcase",
  "Voice Data Collection",
  "Trusted by Communities &amp; Enterprises",
  "About LinguaLink",
  "Our Mission",
  "Data Dignity",
  "LinguaLink",
];

for (const landmark of requiredLandmarks) {
  assert.ok(source.includes(landmark), "missing homepage landmark: " + landmark);
}

for (const removedAsset of ["hero.jpg", "community.jpg", "DownloadSimple", "play.google.com", "apple.com"]) {
  assert.ok(!source.includes(removedAsset), "removed homepage dependency still present: " + removedAsset);
}

assert.ok(!page.includes("VoiceIllustration"), "hero illustration should be removed from the homepage");
assert.ok(!page.includes("HomeHeroIllustration"), "unused hero illustration code should be removed from the homepage");
assert.ok(!logo.includes("LogoMark"), "shared logo should be text-only");

for (const placeholder of ['href="#"', "about-hero.jpg", "about-people.jpg"]) {
  assert.ok(!source.includes(placeholder), "placeholder or old page asset still present: " + placeholder);
}

assert.ok(nav.includes('{ href: "/about", label: "About us" }'), "main navigation should link to the standalone about page");
assert.ok(footer.includes('{ href: "/privacy", label: "Privacy" }'), "footer should keep a functional privacy link");
assert.ok(footer.includes('{ href: "/terms", label: "Terms" }'), "footer should keep a functional terms link");

console.log("Marketing page check passed (" + requiredLandmarks.length + " required landmarks).");
