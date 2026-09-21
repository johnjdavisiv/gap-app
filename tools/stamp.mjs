#!/usr/bin/env node
// Cache-busting: rewrite the ?v= stamp on this app's OWN css/js links (rwBuild.stamp in package.json) in every
// shipped page (the .html files in rwBuild.files).
//
//   node tools/stamp.mjs            -> today's date, e.g. ?v=2026-09-21 (the suite's convention, WEB_APP_INCONSISTENCIES.md §0)
//   node tools/stamp.mjs 1.0.1      -> ?v=1.0.1
//   node tools/stamp.mjs dev        -> back to ?v=dev for local work behind a no-store dev server
//
// `npm run build` runs this first: SiteGround serves css/js with a one-year max-age, so a browser only refetches a
// file when its URL changes. The shared gallery files (apps.js, app-gallery.*) keep their own stamp, which is bumped
// suite-wide by hand when THEY change. This file is byte-identical in every vanilla RW repo.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const cfg = pkg.rwBuild || {};
const OWN = cfg.stamp || [];
const PAGES = (cfg.files || []).filter((f) => f.endsWith('.html'));
const stamp = process.argv[2] || new Date().toISOString().slice(0, 10);

const seen = Object.fromEntries(OWN.map((f) => [f, 0]));
for (const page of PAGES) {
    const file = path.join(ROOT, page);
    let html = fs.readFileSync(file, 'utf8');
    let count = 0;
    for (const f of OWN) {
        const re = new RegExp(`(?<=["'/])${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\?v=[^"']*(?=["'])`, 'g');
        html = html.replace(re, () => { count++; seen[f]++; return `${f}?v=${stamp}`; });
    }
    fs.writeFileSync(file, html);
    console.log(`${page}: ${count} link(s) stamped ?v=${stamp}`);
}
for (const f of OWN) if (!seen[f]) console.log(`warning: no ?v= link to ${f} found in ${PAGES.join(', ')}`);
