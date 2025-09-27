import fs from "node:fs";
const inPath = process.argv[2];
if (!inPath) { console.error("Usage: tsx strip-jsonc.ts <input.jsonc>"); process.exit(1); }
const raw = fs.readFileSync(inPath, "utf8");
const stripped = raw
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/(^|[\s;,{])\/\/.*$/gm, "")
  .trim();
try {
  const obj = JSON.parse(stripped);
  process.stdout.write(JSON.stringify(obj, null, 2));
} catch (e) {
  console.error("JSON parse failed. Check your JSONC:", (e as Error).message);
  process.exit(2);
}
