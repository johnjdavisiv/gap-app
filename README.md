# Running Writings grade-adjusted pace (GAP) calculator

Web app using metabolic data from flat-ground and incline/decline running to calculate metabolically equivalent paces on uphills and downhills.  

**See live version here:** [https://apps.runningwritings.com/gap-calculator/](https://apps.runningwritings.com/gap-calculator/)

## Build and deploy

```
npm run build      # stamps this app's own css/js with today's date, then assembles dist/ (exactly the upload set)
```

Deploy = upload the contents of `dist/` to the SiteGround path the build prints. The build fails if a referenced asset is missing, if a page points at a file that is not in `dist/`, or if a `?v=dev` stamp is left. `tools/build-dist.mjs` and `tools/stamp.mjs` are byte-identical across the RW web apps; this app's file list is `rwBuild` in `package.json`.
