// Usage: tsx builder/scripts/idea-to-spec.ts apps/my_app1/specs/idea.txt
import fs from "node:fs";
import path from "node:path";
const inPath = process.argv[2];
if (!inPath) {
  console.error("Usage: tsx idea-to-spec.ts <idea.txt>");
  process.exit(1);
}
const raw = fs.readFileSync(inPath, "utf8");
const pick = (re: RegExp, fallback = "") => (raw.match(re)?.[1] ?? fallback).trim();
const title = pick(/^title:\s*(.+)$/im) || (raw.split(/\r?\n/).find(Boolean) ?? "My App");
const one = pick(/^one_liner:\s*(.+)$/im, "");
const must = pick(/^must:\s*(.+)$/im, "home, add")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .slice(0, 2);
const spec = `// generated from idea.txt
{
  "version": "1.0",
  "idea": { "title": ${JSON.stringify(title)}${one ? `, "one_liner": ${JSON.stringify(one)}` : ""} },
  "scope": { "must_features": ${JSON.stringify(must)} }
}
`;
fs.writeFileSync(path.join(path.dirname(inPath), "app.spec.jsonc"), spec, "utf8");
console.log("✅ wrote", path.join(path.dirname(inPath), "app.spec.jsonc"));
