const { existsSync, readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const file = join(
  process.cwd(),
  "node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/load-manifest.js",
);

if (!existsSync(file)) {
  console.warn("OpenNext load-manifest.js not found; skipping preview-props patch.");
  process.exit(0);
}

let source = readFileSync(file, "utf8");
let changed = false;

const originalGlob = "**/{*-manifest,required-server-files,prefetch-hints}.json";
const patchedGlob = "**/{*-manifest,required-server-files,prefetch-hints,preview-props}.json";
if (source.includes(originalGlob) && !source.includes(patchedGlob)) {
  source = source.replace(originalGlob, patchedGlob);
  changed = true;
}

const originalFallback = `        p.endsWith("prefetch-hints")) {
      return {};
    }`;
const patchedFallback = `        p.endsWith("prefetch-hints") ||
        p.endsWith("preview-props")) {
      return {};
    }`;
if (source.includes(originalFallback) && !source.includes(patchedFallback)) {
  source = source.replace(originalFallback, patchedFallback);
  changed = true;
}

if (!changed) {
  console.log("OpenNext preview-props loadManifest handling already patched.");
  process.exit(0);
}

writeFileSync(file, source);
console.log("Patched OpenNext to handle Next.js 16.4 preview-props.json.");
