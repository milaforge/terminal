import { describe, expect, it } from "vitest";
import {
  getClientRoutePathForClick,
  getClientRoutePath,
  parseAppRoute,
  withBasePath,
} from "../appRouting";

const base = "/terminal/";
const current = {
  origin: "https://milaforge.dev",
  pathname: "/terminal/book/",
  search: "",
  hash: "",
};

describe("app routing", () => {
  it("parses book routes under the configured base path", () => {
    expect(parseAppRoute("/terminal/book/automation-risk/", base)).toEqual({
      name: "book",
      slug: "automation-risk",
      legacy: false,
    });
  });

  it("accepts legacy blog routes while marking them for canonicalization", () => {
    expect(parseAppRoute("/terminal/blog/automation-risk/", base)).toEqual({
      name: "book",
      slug: "automation-risk",
      legacy: true,
    });
  });

  it("builds canonical app paths with the configured base path", () => {
    expect(withBasePath("/book/automation-risk/", base)).toBe(
      "/terminal/book/automation-risk/",
    );
  });

  it("allows same-origin app routes to be handled by React", () => {
    expect(
      getClientRoutePath(
        "https://milaforge.dev/terminal/book/automation-risk/",
        current,
        base,
      ),
    ).toBe("/terminal/book/automation-risk/");
  });

  it("normalizes the book index to the prerendered slash route", () => {
    expect(
      getClientRoutePath("https://milaforge.dev/terminal/book", current, base),
    ).toBe("/terminal/book/");
  });

  it("canonicalizes legacy blog links to book links", () => {
    expect(
      getClientRoutePath("https://example.com/terminal/blog", current, base),
    ).toBe("/terminal/book/");
    expect(
      getClientRoutePath(
        "https://example.com/terminal/blog/automation-risk/",
        current,
        base,
      ),
    ).toBe("/terminal/book/automation-risk/");
  });

  it("keeps book topic filters in client-handled routes", () => {
    expect(
      getClientRoutePath(
        "https://milaforge.dev/terminal/book/?tag=security",
        current,
        base,
      ),
    ).toBe("/terminal/book/?tag=security");
  });

  it("keeps external and out-of-app links as document navigations", () => {
    expect(
      getClientRoutePath(
        "https://example.com/terminal/blog/automation-risk/",
        current,
        base,
      ),
    ).toBeNull();
    expect(
      getClientRoutePath("https://example.com/terminal/blog/", current, base),
    ).toBeNull();
  });

  it("allows unmodified left-clicks on same-origin app links to stay in React", () => {
    expect(
      getClientRoutePathForClick(
        { button: 0 },
        "https://milaforge.dev/terminal/book/",
        "",
        false,
        current,
        base,
      ),
    ).toBe("/terminal/book/");
  });

  it("preserves browser navigation for modified, download, and new-tab clicks", () => {
    expect(
      getClientRoutePathForClick(
        { button: 0, metaKey: true },
        "https://milaforge.dev/terminal/book/",
        "",
        false,
        current,
        base,
      ),
    ).toBeNull();
    expect(
      getClientRoutePathForClick(
        { button: 0 },
        "https://milaforge.dev/terminal/book/",
        "_blank",
        false,
        current,
        base,
      ),
    ).toBeNull();
    expect(
      getClientRoutePathForClick(
        { button: 0 },
        "https://milaforge.dev/terminal/book/",
        "",
        true,
        current,
        base,
      ),
    ).toBeNull();
  });

  it("preserves native same-page hash navigation", () => {
    expect(
      getClientRoutePathForClick(
        { button: 0 },
        "https://milaforge.dev/terminal/book/automation-risk/#failure-mode",
        "",
        false,
        {
          origin: "https://milaforge.dev",
          pathname: "/terminal/book/automation-risk/",
          search: "",
          hash: "",
        },
        base,
      ),
    ).toBeNull();
  });
});
