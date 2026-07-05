# Current phase

Homepage and article layout slice implemented. `/blog` now renders the unfinished-book identity from centralized metadata.

# Repository findings

The repository is an existing Vite React application, not a documentation framework.

Observed from current files:

* React `^18.2.0`.
* Vite `^5.0.0`.
* App entry: `src/main.tsx` and `src/App.tsx`.
* Blog page: `src/pages/BlogPage.tsx`.
* Blog index/data loader: `src/data/blogIndex.ts`.
* Book chapter registry: `src/data/bookChapters.ts`.
* Book entry registry: `src/data/bookEntries.ts`.
* Shared raw book metadata: `src/data/bookChapters.json` and `src/data/bookEntries.json`.
* Book derived index and validation: `src/data/bookIndex.ts`.
* Markdown articles: `src/data/blogs/*.md`.
* Markdown renderer: `src/components/MarkdownBlock.tsx`.
* Static prerender script: `scripts/prerender-blog.js`.
* Shared styling and blog design tokens: `src/global.css`.
* Route helpers: `src/utils/appRouting.ts`.
* Test runner: Vitest through `pnpm test`.
* Build: `pnpm build`.

# Existing blog architecture

`/blog/` and `/blog/:slug/` are parsed by handwritten pathname routing in `src/utils/appRouting.ts` and rendered by `BlogPage`.

Markdown files are loaded in the client bundle with `import.meta.glob` using `?raw`. Front matter currently supports title, date, tags, and summary. Reading time and search lines are derived in `blogIndex.ts`.

`scripts/prerender-blog.js` independently reads `src/data/blogs/*.md`, parses similar front matter, renders Markdown with `marked`, and writes static `dist/blog/index.html` plus one `dist/blog/<slug>/index.html` per article after Vite build.

Current `/blog/` UI renders The Unfinished Book identity, chapter-grouped entries, entry statuses, central claims, revision dates, and recent revisions.

Current `/blog/:slug/` UI preserves Markdown body rendering and existing article routes while adding book metadata, central claim, first-written/revised dates, status, chapter metadata, and previous/next idea navigation.

# Decisions already made

* Keep the existing React/Vite application.
* Preserve existing `/blog/` and `/blog/:slug/` URLs.
* Prefer a typed metadata registry and validation before visual redesign.
* Use stable entry IDs for relationships.
* Do not use titles as relationship foreign keys.
* Do not choose MDX unless a later implementation proves it is necessary and compatible.
* Start relationships as empty arrays until a content review can justify specific relationships.
* Use Markdown filenames/current blog slugs as the URL-preserving slug source.
* Store raw book metadata in JSON so both the React app and plain Node prerender script consume the same source.
* Keep article comments for now because whether comments should remain is still an author decision.

# Completed work

Created planning documents:

* `docs/unfinished-book/GOAL.md`
* `docs/unfinished-book/ARCHITECTURE.md`
* `docs/unfinished-book/STATE.md`

Updated `AGENTS.md` to point future unfinished-book work at those documents and define authority order.

Implemented content foundation:

* Added `src/data/bookChapters.ts` with the initial chapter registry.
* Added `src/data/bookEntries.ts` with one centralized metadata entry for every current Markdown article slug.
* Added `src/data/bookIndex.ts` with metadata validation, Markdown post joining, reading-path ordering, recent revision ordering, and previous/next navigation derivation.
* Added `src/data/__tests__/bookIndex.test.ts` covering valid metadata, slug preservation, reading path, navigation, and validation failures.

Implemented homepage and article layout slice:

* Moved raw book metadata into `src/data/bookChapters.json` and `src/data/bookEntries.json`.
* Updated `src/data/bookChapters.ts` and `src/data/bookEntries.ts` to expose typed metadata from the shared JSON files.
* Updated `src/pages/BlogPage.tsx` to consume `bookIndex` for book homepage and article metadata.
* Added chapter-grouped homepage navigation, book identity copy, recent revisions, central claims, status labels, revised dates, and previous/next idea navigation.
* Updated `scripts/prerender-blog.js` to render the same book homepage/article metadata from the shared JSON source.
* Added scoped CSS in `src/global.css` using existing blog design tokens.
* Changed visible book dates to relative text such as `4 weeks before`, with exact original dates exposed through native hover tooltips.
* Added a minimal diagonal-pattern background to chapter titles using dark/light blog theme variables.
* Expanded the chapter pattern from the title chip to the full chapter header row and strengthened row text contrast for both themes.
* Removed redundant hero labeling by keeping `The Unfinished Book` as the H1 and using `Systems under uncertainty` as the eyebrow in both React and prerendered `/blog/` output.
* Removed visible estimated reading time from book homepage and article metadata.
* Reworked book typography toward `DM Sans` and `Space Grotesk` instead of the heavier terminal/monospace feel.
* Compressed entry metadata from full code/status/date strings to readable labels such as `Boundary 01`, `Stable`, and `Updated 4 wk ago`, with exact/full values preserved in tooltips and accessible labels.
* Increased chapter-row pattern opacity, border visibility, and row text contrast after visual review.

# In-progress work

No unfinished-book code implementation is in progress beyond the completed homepage/article layout slice.

# Validation status

Validation now covers the book metadata foundation. The UI is unchanged, so current article routes remain served by the existing blog implementation.

Passing checks from the content-foundation session:

* `pnpm test -- src/data/__tests__/bookIndex.test.ts`
* `pnpm exec tsc --noEmit`
* `git diff --check`
* `pnpm build`

Notes:

* The targeted Vitest invocation currently ran the full suite: 20 test files, 83 tests.
* `pnpm build` prerendered the existing blog index and 9 blog posts.
* Build still reports existing Browserslist data and large chunk warnings.

Passing checks from the homepage/article layout session:

* `pnpm test -- src/data/__tests__/bookIndex.test.ts src/data/__tests__/blogIndex.test.ts src/utils/__tests__/appRouting.test.ts`
* `pnpm exec tsc --noEmit`
* `git diff --check`
* `pnpm build`
* Static HTML inspection with `rg` confirmed `dist/blog/index.html` and `dist/blog/prompt-boundaries-not-security-boundaries/index.html` contain the book identity, chapter marker, central claim, and continue-through-book navigation.
* Static HTML inspection with `rg` confirmed relative date text and exact-date tooltip attributes are present in prerendered book pages.
* `pnpm build` passed after expanding the chapter pattern to the full row.
* `pnpm exec tsc --noEmit`, route/book/blog tests, `git diff --check`, and `pnpm build` passed after the typography/minimal metadata pass.
* Static HTML inspection confirmed compact metadata labels and no visible `blog-readTime` output in prerendered book pages.
* `git diff --check` and `pnpm build` passed after increasing chapter-row visibility.

# Commands run

```sh
sed -n '1,220p' /home/dev/.codex/attachments/60d52d02-5b74-4546-81f0-cb83f0b932bc/pasted-text.txt
sed -n '221,520p' /home/dev/.codex/attachments/60d52d02-5b74-4546-81f0-cb83f0b932bc/pasted-text.txt
rg -n "brand/terminal|reliability lab|case studies|terminal" /home/dev/.codex/memories/MEMORY.md
git status --short
ls
sed -n '1,220p' AGENTS.md
sed -n '1,220p' package.json
rg --files src public docs
git diff -- AGENTS.md
find documents -maxdepth 3 -type f -print
find documents/unfinished-book -maxdepth 1 -type f -print -exec sed -n '1,220p' {} \;
sed -n '1,260p' src/data/blogIndex.ts
sed -n '1,260p' src/pages/BlogPage.tsx
sed -n '261,620p' src/pages/BlogPage.tsx
sed -n '1,260p' scripts/prerender-blog.js
sed -n '220,520p' scripts/prerender-blog.js
sed -n '1,220p' vite.config.js
sed -n '1,240p' src/App.tsx
sed -n '1,220p' src/global.css
sed -n '1,240p' src/utils/appRouting.ts
sed -n '1,260p' AGENTS.md
sed -n '1,260p' docs/unfinished-book/GOAL.md
sed -n '1,320p' docs/unfinished-book/ARCHITECTURE.md
sed -n '1,220p' docs/unfinished-book/STATE.md
git status --short
git diff --stat && git diff -- src/data docs AGENTS.md package.json
sed -n '1,260p' src/data/__tests__/blogIndex.test.ts
sed -n '1,220p' tsconfig.json
for f in src/data/blogs/*.md; do printf '\n--- %s ---\n' "$f"; sed -n '1,30p' "$f"; done
rg -n "describe\(|expect\(|toEqual\(|toContain" src/data/__tests__ src/utils/__tests__
pnpm test -- src/data/__tests__/bookIndex.test.ts
pnpm build
pnpm exec tsc --noEmit
pnpm test -- src/data/__tests__/bookIndex.test.ts
git diff --check
pnpm build
sed -n '1,260p' docs/unfinished-book/STATE.md
git status --short
sed -n '1,520p' src/pages/BlogPage.tsx
sed -n '1,380p' scripts/prerender-blog.js
sed -n '4660,5285p' src/global.css
sed -n '380,520p' scripts/prerender-blog.js
sed -n '1,220p' src/data/bookChapters.ts
sed -n '1,280p' src/data/bookEntries.ts
sed -n '1,360p' src/data/bookIndex.ts
sed -n '1,220p' src/__tests__/App.test.ts src/utils/__tests__/appRouting.test.ts
pnpm exec tsc --noEmit
pnpm test -- src/data/__tests__/bookIndex.test.ts src/data/__tests__/blogIndex.test.ts src/utils/__tests__/appRouting.test.ts
pnpm build
git diff --check
rg -n "The Unfinished Book|Boundaries|Central claim|Continue through the book|BOUNDARY-01|Recent revisions" dist/blog/index.html dist/blog/prompt-boundaries-not-security-boundaries/index.html
rg -n "before|today|title=\"20|chapter-boundaries|Central claim|The Unfinished Book" dist/blog/index.html dist/blog/prompt-boundaries-not-security-boundaries/index.html
git diff -- src/global.css
git diff --check
pnpm build
pnpm exec tsc --noEmit
pnpm test -- src/data/__tests__/bookIndex.test.ts src/data/__tests__/blogIndex.test.ts src/utils/__tests__/appRouting.test.ts
rg -n "Boundary 01|Stable|Updated|wk ago|mo ago|yr ago|minute|read|blog-readTime" dist/blog/index.html dist/blog/prompt-boundaries-not-security-boundaries/index.html
git diff -- src/global.css
git diff --check
pnpm build
```

# Known issues

* `AGENTS.md` had pre-existing uncommitted edits before this documentation pass.
* An untracked `documents/unfinished-book/` directory exists with empty `GOAL.md`, `ARCHITECTURE.md`, and `STATE.md`, plus `draft.md`. The requested canonical path is `docs/unfinished-book/`.
* Current front matter includes `slug` in some Markdown files, but runtime slug identity is derived from filenames.
* The client blog loader and prerender script duplicate front-matter parsing and reading-time logic.
* `package.json` does not expose separate lint or typecheck scripts.
* No article relationships have been populated yet because relationship claims need author/content review.
* `vite.config.js` has an unrelated uncommitted `server.host` change in the worktree that was not part of unfinished-book implementation.
* The UI has not received browser screenshot/accessibility QA yet.
* Prerender and React rendering now share metadata, but the prerender script still has its own Markdown/front-matter parsing path.

# Author decisions required

* Confirm whether the untracked `documents/unfinished-book/` directory should be removed, migrated, or ignored.
* Confirm final chapter placement for each existing article after reviewing content.
* Confirm whether comments remain on article pages after the book conversion.
* Confirm whether `ideas` should become an Open Questions entry, a map/backlog page, or be split into multiple fragments.
* Confirm the initial central claims and statuses in `src/data/bookEntries.ts`.

# Next recommended task

Implement the relationships and reflection sections slice only after author/content review supplies real relationships or confirms the current metadata:

1. review each article and confirm defensible `relationships`, `currentBelief`, `whatCouldChangeMyMind`, and `unresolved` fields;
2. update `src/data/bookEntries.json` only with relationships and reflection fields that are supported by article content;
3. render relationship/reflection sections in `src/pages/BlogPage.tsx` and `scripts/prerender-blog.js` only when fields are present;
4. keep empty relationship sets visually absent;
5. run book/blog/route tests, `pnpm exec tsc --noEmit`, `git diff --check`, `pnpm build`, and browser responsive QA.
