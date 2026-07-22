import { describe, expect, it } from "vitest";
import {
  getClientRoutePathForClick,
  getClientRoutePath,
  parseAppRoute,
  withBasePath,
} from "../appRouting";

const base = "/terminal/";
const current = {
  origin: "https://example.test",
  pathname: "/terminal/book/",
  search: "",
  hash: "",
};

describe("app routing", () => {
  it("parses root-hosted story and team routes", () => {
    expect(parseAppRoute("/", "/")).toEqual({ name: "home" });
    expect(parseAppRoute("/team", "/")).toEqual({ name: "team" });
    expect(parseAppRoute("/terminal", "/")).toEqual({ name: "notFound" });
  });

  it("parses book routes under the configured base path", () => {
    expect(parseAppRoute("/terminal/book/automation-risk/", base)).toEqual({
      name: "book",
      slug: "automation-risk",
      legacy: false,
    });
  });

  it("parses blog routes as the blog surface", () => {
    expect(parseAppRoute("/terminal/blog/automation-risk/", base)).toEqual({
      name: "blog",
      slug: "automation-risk",
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
        "https://example.test/terminal/book/automation-risk/",
        current,
        base,
      ),
    ).toBe("/terminal/book/automation-risk/");
  });

  it("allows root-hosted team links to be handled by React", () => {
    const rootCurrent = {
      origin: "https://example.test",
      pathname: "/",
      search: "",
      hash: "",
    };

    expect(getClientRoutePath("https://example.test/team", rootCurrent, "/")).toBe(
      "/team/",
    );
  });

  it("leaves the removed root-hosted terminal path to document navigation", () => {
    const rootCurrent = {
      origin: "https://example.test",
      pathname: "/",
      search: "",
      hash: "",
    };

    expect(getClientRoutePath("https://example.test/terminal", rootCurrent, "/")).toBeNull();
  });

  it("leaves unknown root-hosted paths to document navigation", () => {
    expect(
      getClientRoutePath(
        "https://example.test/not-a-route",
        {
          origin: "https://example.test",
          pathname: "/",
          search: "",
          hash: "",
        },
        "/",
      ),
    ).toBeNull();
    expect(
      getClientRoutePath(
        "https://example.test/not-a-route-again",
        {
          origin: "https://example.test",
          pathname: "/",
          search: "",
          hash: "",
        },
        "/",
      ),
    ).toBeNull();
  });


  it("normalizes the book index to the prerendered slash route", () => {
    expect(
      getClientRoutePath("https://example.test/terminal/book", current, base),
    ).toBe("/terminal/book/");
  });

  it("keeps blog links on the blog surface", () => {
    expect(
      getClientRoutePath(
        "https://example.test/terminal/blog",
        current,
        base,
      ),
    ).toBe("/terminal/blog/");
    expect(
      getClientRoutePath(
        "https://example.test/terminal/blog/automation-risk/",
        current,
        base,
      ),
    ).toBe("/terminal/blog/automation-risk/");
  });

  it("keeps book topic filters in client-handled routes", () => {
    expect(
      getClientRoutePath(
        "https://example.test/terminal/book/?tag=security",
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
        "https://example.test/terminal/book/",
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
        "https://example.test/terminal/book/",
        "",
        false,
        current,
        base,
      ),
    ).toBeNull();
    expect(
      getClientRoutePathForClick(
        { button: 0 },
        "https://example.test/terminal/book/",
        "_blank",
        false,
        current,
        base,
      ),
    ).toBeNull();
    expect(
      getClientRoutePathForClick(
        { button: 0 },
        "https://example.test/terminal/book/",
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
        "https://example.test/terminal/book/automation-risk/#failure-mode",
        "",
        false,
        {
          origin: "https://example.test",
          pathname: "/terminal/book/automation-risk/",
          search: "",
          hash: "",
        },
        base,
      ),
    ).toBeNull();
  });
});
