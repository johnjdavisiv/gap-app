#!/usr/bin/env node
// Assemble the upload set in dist/ so deploying a vanilla RW web app works like the Vite apps:
//
//   npm run build        -> tools/stamp.mjs (today's date on this app's own css/js), then rebuild dist/
//   npm run build:dev    -> rebuild dist/ without stamping (?v=dev allowed; never upload that)
//
// Upload the CONTENTS of dist/ to the SiteGround path printed at the end. Nothing else in the repo belongs
// on the server (plans, READMEs, analysis, R scripts, data files, tests, tools).
//
// Config = "rwBuild" in package.json:
//   files      root files to ship: the page(s), their css/js, the shared gallery trio, .htaccess on the home page
//   assetDirs  directories whose files ship only when something in `files` references them (default fonts, images)
//   stamp      this app's own css/js whose ?v= tools/stamp.mjs rewrites (the shared gallery files are bumped by hand)
//   deploy     where the contents of dist/ go on SiteGround
//
// Every fonts/… and images/… token found in the shipped root files (html, css AND js) is copied along, so the
// favicon, the explainer figures, the social card and a runtime image in scripts.js come automatically, and a new
// image ships as soon as a page points at it. The build FAILS if a referenced asset is missing from the repo, if a
// local src/href in a shipped page has no file in dist/, or if a page still carries ?v=dev (unless --allow-dev).
//
// This file is byte-identical in every vanilla RW repo — change it everywhere or nowhere.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');
const allowDev = process.argv.includes('--allow-dev');
const fail = (msg) => { console.error(`build-dist: ${msg}`); process.exit(1); };

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const cfg = pkg.rwBuild || fail('package.json has no "rwBuild" config');
const ROOT_FILES = cfg.files || fail('rwBuild.files is missing');
const ASSET_DIRS = cfg.assetDirs || ['fonts', 'images'];
const md5 = (p) => crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');

// 1. root files must exist
for (const f of ROOT_FILES) if (!fs.existsSync(path.join(ROOT, f))) fail(`missing root file ${f}`);

// 2. assets = every <assetDir>/<name>.<ext> token in the shipped root files (names may contain spaces)
const assets = new Set();
const tokenRe = new RegExp(`\\b(?:${ASSET_DIRS.join('|')})/[A-Za-z0-9._ -]*?\\.[A-Za-z0-9]{2,5}(?=["')\\s>]|$)`, 'g');
for (const f of ROOT_FILES) {
    const text = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of text.matchAll(tokenRe)) assets.add(m[0]);
}
const missing = [...assets].filter((a) => !fs.existsSync(path.join(ROOT, a)));
if (missing.length) fail(`referenced but not in the repo:\n  ${missing.join('\n  ')}`);

// 3. rebuild dist/
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST);
const files = [...ROOT_FILES, ...[...assets].sort()];
for (const rel of files) {
    const dest = path.join(DIST, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(ROOT, rel), dest);
}

// 4. every local src/href in a shipped page resolves inside dist/; no ?v=dev left
const pages = ROOT_FILES.filter((f) => f.endsWith('.html'));
const broken = [];
let devStamps = 0;
for (const page of pages) {
    const html = fs.readFileSync(path.join(DIST, page), 'utf8');
    devStamps += (html.match(/\?v=dev\b/g) || []).length;
    for (const m of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
        const url = m[1];
        if (/^(https?:|mailto:|tel:|#|data:|\/\/)/.test(url)) continue;
        const rel = url.replace(/^\//, '').split(/[?#]/)[0];
        if (!rel || rel.endsWith('/') || !path.basename(rel).includes('.')) continue;   // a page path, not a file
        if (!fs.existsSync(path.join(DIST, rel))) broken.push(`${page}: ${url}`);
    }
}
if (broken.length) fail(`pages point at files that are not in dist/:\n  ${broken.join('\n  ')}`);
if (devStamps && !allowDev) fail(`${devStamps} ?v=dev stamp(s) left — run \`npm run build\` (stamps first) or pass --allow-dev`);

// 5. manifest
let total = 0;
console.log(`dist/  (${files.length} files)`);
for (const rel of files) {
    const size = fs.statSync(path.join(DIST, rel)).size;
    total += size;
    console.log(`  ${md5(path.join(DIST, rel)).slice(0, 8)}  ${String(Math.ceil(size / 1024)).padStart(5)} KB  ${rel}`);
}
console.log(`  total ${Math.ceil(total / 1024)} KB${devStamps ? '  (?v=dev — do not upload)' : ''}`);
const unreferenced = ASSET_DIRS.flatMap((d) => fs.existsSync(path.join(ROOT, d))
    ? fs.readdirSync(path.join(ROOT, d)).map((f) => `${d}/${f}`).filter((f) => !assets.has(f) && !f.endsWith('.DS_Store')) : []);
if (unreferenced.length) console.log(`  left out (nothing references them): ${unreferenced.join(', ')}`);
if (cfg.deploy) console.log(`  -> upload the contents of dist/ to ${cfg.deploy}`);
