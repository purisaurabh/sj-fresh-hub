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
const originalGlob = "**/{*-manifest,required-server-files,prefetch-hints}.json";
const patchedGlob = "**/{*-manifest,required-server-files,prefetch-hints,preview-props}.json";

if (source.includes(patchedGlob)) {
  console.log("OpenNext already inlines preview-props.json.");
  process.exit(0);
}

if (!source.includes(originalGlob)) {
  console.warn("OpenNext loadManifest glob not found; skipping preview-props patch.");
  process.exit(0);
}

source = source.replace(originalGlob, patchedGlob);
writeFileSync(file, source);
console.log("Patched OpenNext to inline Next.js 16.4 preview-props.json.");
