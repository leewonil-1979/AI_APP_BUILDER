import fs from "node:fs/promises";
import path from "node:path";

const [name, ...rest] = process.argv.slice(2);
if (!name) { console.error("Usage: tsx builder/scripts/new-app.ts <appName> [--force]"); process.exit(1); }
const force = rest.includes("--force");

const repo = process.cwd();
const template = path.join(repo, "builder", "templates", "app", "your_app");
const dest = path.join(repo, "apps", name);

async function exists(p: string) { try { await fs.access(p); return true; } catch { return false; } }
async function rmrf(p: string) { await fs.rm(p, { recursive: true, force: true }); }
async function copyDir(src: string, dst: string) {
  await fs.mkdir(dst, { recursive: true });
  for (const e of await fs.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) await copyDir(s, d);
    else if (e.isFile()) await fs.copyFile(s, d);
  }
}
const TEXT = new Set([".json",".jsonc",".ts",".tsx",".js",".jsx",".md",".yml",".yaml",".txt",".xml",".env",".config"]);

async function replace(root: string) {
  const stack = [root];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const e of await fs.readdir(cur, { withFileTypes: true })) {
      const p = path.join(cur, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.isFile()) {
        const ext = path.extname(e.name).toLowerCase();
        if (TEXT.has(ext) || e.name === "app.yml" || e.name === "README.md") {
          const src = await fs.readFile(p, "utf8");
          const out = src.replaceAll("app-{{slug}}", `app-${name}`).replaceAll("YOUR_APP_NAME", name).replaceAll("app-template", name);
          if (out !== src) await fs.writeFile(p, out, "utf8");
        }
      }
    }
  }
}

(async () => {
  if (!(await exists(template))) { console.error("Template not found:", template); process.exit(1); }
  if (await exists(dest)) {
    if (!force) { console.error(`already exists: ${dest} (use --force to overwrite)`); process.exit(1); }
    await rmrf(dest);
  }
  await copyDir(template, dest);
  await replace(dest);
  console.log(`✅ Created ${path.relative(repo, dest)}`);
  console.log(`Next:\n  1) Edit apps/${name}/specs/app.spec.jsonc\n  2) npm run --prefix .\\apps\\${name} app:init`);
})();
