# The Unfinished Book Goal

## Product definition

`/book` should be **The Unfinished Book**: an interconnected inventory of ideas about systems, failure, reliability, boundaries, judgment, authority, human systems, and trustworthy operation under uncertainty.

Legacy `/blog` URLs should remain as compatibility redirects so previously shared links do not break.

Homepage identity:

```text
The Unfinished Book

Notes toward building systems—and a life—that remain trustworthy under uncertainty.
```

Conceptual explanation:

```text
This is not a chronological blog. It is a book in progress:
arguments being refined, principles being tested, and observations
connected over time.
```

The project remains the existing React application. The book is not a migration to Docusaurus, Next.js, or another publishing framework.

## Transformation from blog to book

The current blog presents independent posts. The target experience presents entries as parts of a developing body of thought.

Each entry may establish, extend, support, challenge, depend on, or remain in tension with another entry. The system should make those relationships visible without pretending the work is finished.

## Intended reader experience

A reader should be able to:

* understand the book's central territory from the `/book` homepage;
* browse by chapter instead of only reverse chronology;
* see how mature each entry is;
* follow a previous or next idea through a deliberate reading path;
* discover entries revised recently;
* understand the central claim of an entry before reading deeply;
* inspect unresolved questions and what could change the author's mind;
* travel through explicit relationships between ideas.

## Core principles

* Editorial, restrained, deliberate, technical, alive.
* Intellectually unfinished without looking broken.
* Relationships must be meaningful, not decorative.
* Old articles remain alive through revision metadata.
* Existing article URLs must be preserved.
* Build-time validation should catch broken metadata before deployment.
* The public surface should help readers inspect judgment, reliability thinking, and boundary design.

## Interconnected ideas

Interconnection is semantic, not merely topical. Tags can classify entries, but relationships should explain why two ideas belong together.

Supported relationship concepts:

* Extends
* Supports
* Challenges
* In tension with
* Depends on
* Related ideas

Relationships should use stable entry IDs, not titles, as references.

## Chapters, fragments, and revisions

Initial conceptual chapters:

* Boundaries
* Failure
* Reliable Agency
* Judgment
* Human Systems
* Open Questions

Article placement must be reviewed against actual content before hard-coding assignments.

Supported maturity states:

* Fragment
* Developing
* Working chapter
* Stable for now
* Under revision

A chapter is a conceptual grouping. A fragment is an incomplete observation, question, or contradiction. A revision is a visible change to an existing idea, not necessarily a new post.

## Desired homepage

The `/book` homepage should lead with the book identity and explanation, then provide chapter navigation, a deliberate reading path, and recent revisions. It should not behave primarily as a chronological feed.

The homepage should make the structure inspectable without requiring the reader to understand implementation details.

## Desired article experience

An entry page should expose:

* title and subtitle where available;
* chapter;
* maturity status;
* first written and last revised dates;
* central claim;
* optional current belief;
* optional what could change my mind;
* unresolved questions;
* explicit relationships;
* previous and next idea navigation;
* existing article body.

The article ending should point readers through the book instead of ending only with generic comments.

## Desired relationship navigation

Relationship navigation should be generated from structured metadata. It should support related entries, contradictions, dependencies, and continuations without manually duplicated links in page components.

A conceptual map should be useful and restrained. It should not become an ornamental graph demonstration.

## Visual direction

Retain the existing restrained terminal/editorial identity while shifting the information architecture toward a living book.

The result should not resemble:

* a generic documentation site;
* a chronological blog feed;
* a SaaS dashboard;
* an ornamental graph demonstration;
* a fake physical book.

## Accessibility expectations

* Preserve semantic headings and landmarks.
* Keep keyboard navigation usable for chapter and relationship links.
* Ensure status labels and relationship groups have text labels, not color-only meaning.
* Preserve readable contrast in dark and light blog themes.
* Keep mobile reading order text-first, with book contents and relationships accessible without blocking the article.

## Performance expectations

The book should remain static-friendly and lightweight. Derived indexes and validation should run at build time where possible. Avoid client-heavy graph or navigation logic until the content model proves it is needed.

## Explicit non-goals

* Full redesign in the planning session.
* Framework migration.
* MDX adoption without proof it integrates cleanly.
* Breaking existing article URLs.
* Fabricating relationships to fill UI.
* Rewriting the author's substantive arguments unless requested.
* Turning the book into generic documentation or a finished manifesto.

## Final acceptance criteria

The conversion is acceptable when:

* `/book` presents The Unfinished Book identity;
* all existing article URLs continue to work;
* entries have validated structured metadata;
* chapters, statuses, central claims, revisions, and relationships render from a central model;
* previous and next idea navigation is derived from content order;
* recent revisions are visible;
* relationship navigation is useful on article pages;
* invalid metadata fails tests or build-time validation;
* the design remains restrained, readable, responsive, and accessible.
