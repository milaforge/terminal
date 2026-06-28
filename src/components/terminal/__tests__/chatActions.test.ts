import { describe, expect, it } from "vitest";
import {
  BOOKING_URL,
  getChatActions,
  getChatDisplayContent,
} from "../chat/chatActions";

describe("chat action extraction", () => {
  it("adds a booking action when the assistant suggests booking", () => {
    const actions = getChatActions(
      "Would you like to book a call? https://cal.com/milaforge/intro",
      "milaforge@proton.me",
    );

    expect(actions).toContainEqual({
      id: "booking",
      kind: "booking",
      label: "Book call",
      href: BOOKING_URL,
    });
    expect(actions).toHaveLength(1);
  });

  it("extracts safe contact links and strips sentence punctuation", () => {
    const actions = getChatActions(
      "Email milaforge@proton.me or message https://t.me/milaforge.",
      "milaforge@proton.me",
    );

    expect(actions).toEqual([
      {
        id: "link:https://t.me/milaforge",
        kind: "link",
        label: "Message on Telegram",
        href: "https://t.me/milaforge",
      },
      {
        id: "email:milaforge@proton.me",
        kind: "email",
        label: "Send email",
        href: "mailto:milaforge@proton.me?subject=Recurring%20workflow%20context",
      },
    ]);
  });

  it("removes targets from visible text when buttons cover them", () => {
    const content =
      "Would you like to book a call?\nhttps://cal.com/milaforge/intro";
    const actions = getChatActions(content, "milaforge@proton.me");

    expect(getChatDisplayContent(content, actions)).toBe(
      "Would you like to book a call?",
    );
  });
});
