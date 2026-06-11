import { describe, expect, it } from "vitest";
import {
  BLOG_COMMENTS_REPO,
  getUtterancesScriptAttributes,
} from "../blogComments";

describe("blog comments", () => {
  it("maps posts to GitHub Issues by pathname", () => {
    expect(getUtterancesScriptAttributes()).toEqual({
      src: "https://utteranc.es/client.js",
      crossorigin: "anonymous",
      async: "true",
      repo: "failuresmith/terminal",
      "issue-term": "pathname",
      label: "blog-comment",
      theme: "github-light",
    });
  });

  it("uses the owner/repository format expected by utterances", () => {
    expect(BLOG_COMMENTS_REPO).toMatch(/^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i);
  });
});
