# The Unfinished Book Architecture

## Existing architecture discovered

This repository is a Vite React single-page application.

Observed stack:

* React `^18.2.0` with `react-dom`.
* Vite `^5.0.0` using `@vitejs/plugin-react`.
* TypeScript source files, with `tsconfig.json`, but no exposed `typecheck` script.
* Handwritten client routing in `src/utils/appRouting.ts`.
* `/book/` and `/book/:slug/` routes rendered by `src/pages/BlogPage.tsx`.
* Legacy `/blog/` and `/blog/:slug/` routes are accepted only for compatibility and should canonicalize to `/book/`.
* Markdown articles stored in `src/data/blogs/*.md`.
* Article metadata parsed from lightweight front matter in `src/data/blogIndex.ts`.
* Markdown is loaded in the app through `import.meta.glob("./blogs/*.md", { eager: true, import: "default", query: "?raw" })`.
* Markdown is rendered with `marked` through `src/components/MarkdownBlock.tsx`.
* Static blog HTML is generated after Vite build by `scripts/prerender-blog.js`.
* Blog styling and design tokens live in `src/global.css` under `.blog-page` and `.t-markdown--blog`.
* Tests use Vitest. The exposed scripts are `pnpm test` and `pnpm build`; no lint script is defined in `package.json`.
* Build output assumes Vite base `/terminal/` and the prerender script defaults `BASE_PATH` to `/terminal/`.

There is Markdown support today. There is no MDX support observed.

## Least disruptive migration strategy

Keep the current Vite React application, current route shape, and current Markdown content pipeline.

Introduce a typed book metadata layer next to the existing blog index, then adapt the blog homepage and article page to render from derived book data. Do not migrate frameworks or replace the Markdown renderer before the content model is proven.

The first implementation should be the content model and validation foundation, not visual redesign.

## Proposed content storage format

Use a TypeScript registry for structured book metadata:

```text
src/data/bookEntries.ts
src/data/bookChapters.ts
src/data/bookIndex.ts
src/data/__tests__/bookIndex.test.ts
```

Continue storing article bodies as Markdown in `src/data/blogs/*.md`.

Do not choose MDX automatically. MDX should be considered only if a later slice proves Markdown cannot support required content and MDX integrates cleanly with Vite, prerendering, tests, and static deployment.

## Typed entry model

The entry model should account for:

```ts
type BookEntryStatus =
  | "Fragment"
  | "Developing"
  | "Working chapter"
  | "Stable for now"
  | "Under revision";

type BookRelationshipType =
  | "extends"
  | "supports"
  | "challenges"
  | "tensions"
  | "dependsOn"
  | "related";

type BookRelationship = {
  type: BookRelationshipType;
  entryId: string;
  note?: string;
};

type BookEntry = {
  id: string;
  slug: string;
  code: string;
  title: string;
  subtitle?: string;
  summary?: string;
  chapter: string;
  order: number;
  status: BookEntryStatus;
  firstWrittenAt: string;
  revisedAt: string;
  readingTime?: number;
  centralClaim: string;
  currentBelief?: string;
  whatCouldChangeMyMind?: string;
  unresolved?: string[];
  relationships?: BookRelationship[];
  tags?: string[];
  hidden?: boolean;
  draft?: boolean;
};
```

`slug` must preserve current article slugs unless there is a verified reason not to.

## Chapter registry

Use a central chapter registry:

```ts
type BookChapter = {
  id: string;
  title: string;
  description: string;
  order: number;
};
```

Initial chapter IDs should map to:

* `boundaries`
* `failure`
* `reliable-agency`
* `judgment`
* `human-systems`
* `open-questions`

Article placement must be reviewed against the current article body and metadata before finalizing assignments.

## Stable IDs and slugs

Use stable `id` values as relationship foreign keys. Do not use titles as foreign keys.

Use `slug` only for URL construction and route preservation. Current article slugs come from Markdown filenames in practice, even though some front matter also contains `slug`.

## Relationship model

Relationship types should account for:

* `extends`
* `supports`
* `challenges`
* `tensions`
* `dependsOn`
* `related`

The UI may label `tensions` as "In tension with" and `related` as "Related ideas".

## Optional reflection fields

`currentBelief`, `whatCouldChangeMyMind`, and `unresolved` should render only when present. Missing reflection fields should not create empty UI.

## Content loading

The book index should join structured `BookEntry` metadata with the current `blogIndex` Markdown content by slug.

This keeps Markdown loading centralized while allowing book-specific fields to be validated independently.

The prerender script currently has a separate Markdown/front-matter parser. Any book migration must either share validation/derived data safely or update the prerender path in the same vertical slice so static HTML and client-rendered HTML do not diverge.

## Indexes and derived data

Derived book data should include:

* visible entries;
* entries by ID;
* entries by slug;
* entries by chapter;
* ordered reading path;
* previous and next idea;
* recent revisions;
* resolved relationship targets;
* tag/topic compatibility where still useful.

Avoid manually maintaining previous/next links inside components.

## Validation

Validation should detect:

* duplicate IDs;
* duplicate slugs;
* missing required fields;
* invalid chapter IDs;
* invalid statuses;
* invalid dates;
* broken relationship references;
* self-references;
* duplicate relationship references;
* inappropriate visible references to hidden entries;
* ambiguous ordering.

Validation should be executable by Vitest first. A later build hook can make the same validation fail production builds.

## Ordering

Within a chapter, `order` must be unique among visible entries. The global reading path should sort by chapter order, then entry order.

Recent revisions should sort by `revisedAt` descending.

## Routes

Use canonical routes:

```text
/book/
/book/:slug/
```

Preserve legacy compatibility:

```text
/blog/
/blog/:slug/
```

The app route parser in `src/utils/appRouting.ts` accepts both route families. Generated links and prerendered content should use `/book/`; `/blog/` should redirect or canonicalize to `/book/`.

## Layout components

Likely components:

```text
src/pages/BookHomePage.tsx
src/pages/BookEntryPage.tsx
src/components/book/BookChapterNav.tsx
src/components/book/BookEntryMeta.tsx
src/components/book/BookRelationships.tsx
src/components/book/BookReflection.tsx
src/components/book/BookReadingNav.tsx
```

This split is a proposal, not a requirement. Keep components small, but do not add abstractions before the first vertical slice needs them.

## Responsive behavior

Desktop can support a left chapter rail, central article, and right relationship/meta rail.

Mobile should render main text first, then collapsible or clearly placed book contents and relationship sections. Relationship cards should not obscure reading.

## Migration strategy for existing articles

1. Add chapter registry and metadata entries for current Markdown files.
2. Preserve every current slug:
   * `automation-risk`
   * `cybersecurity-harsh-truth`
   * `design-tradeoffs`
   * `free-will`
   * `gen-ai-token-compression`
   * `ideas`
   * `premature-scaling`
   * `problem-solving-habit`
   * `prompt-boundaries-not-security-boundaries`
3. Add validation tests for the metadata registry.
4. Join metadata with existing Markdown posts.
5. Replace blog list rendering with chapter-oriented rendering.
6. Replace article metadata and ending with book metadata and relationship navigation.
7. Update prerendered output in the same phase as the client-rendered output.

## Testing strategy

Smallest meaningful checks:

* `pnpm test -- src/data/__tests__/bookIndex.test.ts` for metadata validation once added.
* Existing route tests in `src/utils/__tests__/appRouting.test.ts` when route behavior changes.
* Existing blog tests in `src/data/__tests__/blogIndex.test.ts` when content loading changes.
* `pnpm build` before claiming route, prerender, or static output changes complete.

No lint or typecheck command is currently exposed in `package.json`.

## Implementation phases

1. **Content foundation**
   Add chapter and entry registries, typed model, derived indexes, and validation tests. Do not redesign UI.

2. **Homepage and article layout**
   Convert `/book/` and `/book/:slug/` to render book identity, chapter navigation, entry status, central claim, and reading path while preserving legacy `/blog/` compatibility.

3. **Relationships and reflection sections**
   Render relationship groups, current belief, what could change my mind, and unresolved questions from metadata.

4. **Revisions and map pages**
   Add recent revisions and a restrained conceptual map once relationships are real enough to navigate.

5. **Accessibility, responsive QA, tests, and cleanup**
   Tighten keyboard behavior, mobile layout, prerender parity, tests, and unused blog-language remnants.
