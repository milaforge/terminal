import { clearPersistedHistory } from "./historyStore";
import {
  CommandHandlerContext,
  TerminalLineInput,
  LineSegment,
  CommandSegment,
  CopySegment,
  TextSegment,
  FileMeta,
  RegisterDefaultsArgs,
  OfflineStatus,
  TerminalFontMeta,
  TerminalColorMeta,
  CommandButton,
  SearchHit,
  SampleWork,
  ActivityTreeNode,
  LogItem,
  SubcommandSuggestContext,
  ClientProofSegment,
} from "@types";
import {
  buildAvatarSegment,
  copyToClipboard,
  disableOffline,
  getOfflineStatus,
  refreshOfflineResources,
  findTheme,
  listThemes,
  matchTheme,
} from "@utils";
import { formatBytes, formatMtime, resolveFileMeta } from "@utils/fileMeta";
import { openChat } from "@stores/chatStore";
import { findFileByName, listFiles, listTextFiles } from "../../data/files";
import { blogIndex } from "../../data/blogIndex";
import type { BlogPost } from "../../data/blogIndex";
import packageJson from "../../../package.json";
import {
  runSearch,
  setSearchWorkItems,
  makeWorkSlug,
  sanitizeSearchQuery,
} from "@data/searchIndex";
import { searchStore } from "@stores/searchStore";
import { CLIENT_PROOF_ITEMS, CLIENT_PROOF_TITLE } from "@data/clientProof";
import { SELECTED_CASES } from "@data/selectedCases";
import { findService, SERVICES, SERVICES_INTRO } from "@data/services";

export const DEFAULT_SUGGESTED_COMMANDS: CommandButton[] = [
  {
    command: "selected_cases",
    label: "Case Studies",
    variant: "secondary",
    typing: "simulate",
  },
  {
    command: "download resume",
    label: "Resume",
    variant: "secondary",
    typing: "simulate",
  },
  {
    command: "contact",
    label: "Contact me",
    variant: "primary",
    typing: "simulate",
  },
];

const APP_VERSION = packageJson.version;

const selectedCasesClientProof: ClientProofSegment = {
  type: "clientProof",
  title: CLIENT_PROOF_TITLE,
  items: CLIENT_PROOF_ITEMS,
};
const selectedCasesClientNames = CLIENT_PROOF_ITEMS.map((item) => item.name).join(
  " · ",
);

const createTextSegment = (text: string): TextSegment => ({
  type: "text",
  text,
});

const createCommandSegment = (
  command: string,
  label?: string,
  ariaLabel?: string,
  variant?: CommandButton["variant"],
  typing?: CommandButton["typing"],
): CommandSegment => ({
  type: "command",
  label: label ?? `${command}`,
  command,
  ariaLabel,
  variant,
  typing,
});

const createCopySegment = (value: string, label?: string): CopySegment => ({
  type: "copy",
  value,
  label,
});

const createLinkSegment = (
  href: string,
  label: string,
  options?: { ariaLabel?: string; newTab?: boolean },
) => ({
  type: "link" as const,
  href,
  label,
  ariaLabel: options?.ariaLabel,
  newTab: options?.newTab,
});

const buildCommandButtonLine = (commands: CommandButton[]): LineSegment[] => {
  const segments: LineSegment[] = [createTextSegment("  ")];
  commands.forEach((c, index) => {
    if (index) {
      segments.push(createTextSegment(" · "));
    }
    const cmd = c.command;
    const label = c.label ? c.label : c.command;
    const ariaLabel = label;
    segments.push(
      createCommandSegment(
        cmd,
        label,
        ariaLabel,
        c.variant,
        c.typing ?? "simulate",
      ),
    );
  });
  return segments;
};

const buildContactRow = (label: string, value: string): LineSegment[] => {
  const isEmail = /@/.test(value);
  const valueSegment = isEmail
    ? createLinkSegment(
      `mailto:${value}?subject=Recurring%20workflow%20context`,
      value,
      {
        ariaLabel: `Email ${value}`,
      },
    )
    : createTextSegment(value);

  return [
    createTextSegment(`${label}`),
    createTextSegment("  "),
    valueSegment,
    createTextSegment(" "),
    createCopySegment(value, label),
  ];
};

const HOME_DIR = ["home"];
const FILES_DIR = ["home", "files"];

function normalizePath(input: string, cwd: string[]): string[] | null {
  const raw = (input || "").trim();
  if (!raw) return [...cwd];
  const parts = raw.startsWith("/")
    ? raw.slice(1).split("/")
    : [...cwd, ...raw.split("/")];

  const out: string[] = [];
  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") {
      out.pop();
      continue;
    }
    out.push(part);
  }
  return out.length ? out : [...HOME_DIR];
}

function isDir(parts: string[], target: string[]): boolean {
  return (
    parts.length === target.length && parts.every((p, i) => p === target[i])
  );
}

function resolveFileFromPath(
  token: string,
  cwd: string[],
  resolver: (name: string) => FileMeta | undefined,
): FileMeta | undefined {
  const parts = normalizePath(token, cwd);
  if (!parts) return undefined;

  // only allow files under home/files
  if (parts.length < 2) return undefined;
  const filename = parts[parts.length - 1];
  const dir = parts.slice(0, -1);
  if (!isDir(dir, FILES_DIR)) return undefined;
  return resolver(filename);
}

export function formatCommandToButton(
  prefixPrompt: string,
  commands: CommandButton[],
) {
  return (): TerminalLineInput[] => {
    const list = commands;
    if (!list.length) return [];

    return [prefixPrompt, buildCommandButtonLine(list), ""];
  };
}

const textCache = new Map<string, string>();

const FAQ_ITEMS = [
  {
    question: "What kinds of workflows do you take on?",
    answer:
      "Workflows where manual review, messy inputs, or repeated operational steps are slowing the team down. I turn them into small, maintainable systems with clear state, logs, tests, and handoff points.",
  },
  {
    question: "How quickly can we start?",
    answer: "30 minutes quick intro within 24 hours. Then weekly checkpoints.",
  },
  {
    question: "Do you work async?",
    answer:
      "Yes. I bias to async docs/Looms with a standing sync as needed. Clear updates beat meetings.",
  },
  {
    question: "How do you mesh with our team?",
    answer:
      "I join your Slack/Teams, ship in your repos, and keep PRs small. If you lack process, I bring a light one.",
  },
  {
    question: "Do you respect accessibility preferences?",
    answer:
      "Yes. Prefers-reduced-motion is honored automatically; run `motion status|reduce|allow|auto` to tune animations if you want explicit control.",
  },
];

const ACTIVITY_TREE_NODES: ActivityTreeNode[] = [
  {
    id: "2026",
    title: "Senior backend & platform work",
    period: "2026",
    summary:
      "Reliability-first delivery across backend systems, infra, and execution speed.",
    tags: ["backend", "platform", "reliability"],
    children: [
      {
        id: "2026-reliability",
        title: "Reliability programs",
        period: "Q1–Q2",
        summary: "Cost control, safer rollout, stronger observability.",
        command: "selected_cases read cloud-spend-was-eating-the-runway",
      },
      {
        id: "2026-scale",
        title: "Scale under load",
        period: "Q2",
        summary: "Increased concurrency and kept p95 and uptime stable.",
        command: "selected_cases read growth-was-breaking-the-product",
      },
    ],
  },
  {
    id: "2025",
    title: "Execution for product teams",
    period: "2025",
    summary: "Fast iteration with low-risk execution and measurable outcomes.",
    tags: ["delivery", "execution", "impact"],
    children: [
      {
        id: "2025-mvp",
        title: "Scope-controlled product proof",
        period: "10-day sprints",
        summary: "Shipped investor proof before larger build spend.",
        command:
          "selected_cases read building-too-much-before-proving-the-product",
      },
      {
        id: "2025-secops",
        title: "Security ops automation",
        period: "ongoing",
        summary:
          "Reduced repetitive manual checks, improved analyst throughput.",
        command:
          "selected_cases read skilled-people-were-buried-in-repetitive-work",
      },
    ],
  },
  {
    id: "explore",
    title: "Explore",
    period: "drill-down",
    summary: "Jump from timeline to deeper command views.",
    children: [
      {
        id: "explore-selected-cases",
        title: "Selected cases",
        command: "selected_cases",
      },
      {
        id: "explore-blog",
        title: "Blogs",
        command: "blog list",
      },
    ],
  },
];

type MotionMode = "auto" | "reduce" | "allow";
const MOTION_STORAGE_KEY = "terminal.motion";

const readStoredMotion = (): MotionMode => {
  try {
    const stored = localStorage.getItem(MOTION_STORAGE_KEY);
    if (stored === "reduce" || stored === "allow" || stored === "auto") {
      return stored;
    }
  } catch {
    // ignore
  }
  return "auto";
};

const writeStoredMotion = (mode: MotionMode) => {
  try {
    localStorage.setItem(MOTION_STORAGE_KEY, mode);
  } catch {
    // ignore
  }
};

const prefersReducedMotion = () =>
  typeof matchMedia === "function" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

const applyMotionMode = (mode: MotionMode) => {
  const root = document.documentElement;
  root.classList.remove("motion-reduce");
  root.classList.remove("motion-allow");
  if (mode === "allow") {
    root.classList.add("motion-allow");
    return;
  }
  if (mode === "reduce") {
    root.classList.add("motion-reduce");
    return;
  }
  if (mode === "auto" && prefersReducedMotion()) {
    root.classList.add("motion-reduce");
  }
};

async function getTextForFile(meta: FileMeta): Promise<string> {
  const cached = textCache.get(meta.path);
  if (cached !== undefined) return cached;
  const resp = await fetch(meta.path);
  if (!resp.ok) throw new Error(`fetch failed (${resp.status})`);
  const text = await resp.text();
  textCache.set(meta.path, text);
  return text;
}

async function computeSha256(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function formatFileRow(file: FileMeta) {
  return [
    createTextSegment(
      `  ${file.name.padEnd(18)}   ${formatBytes(file.size).padStart(8)}  `,
    ),
    createCommandSegment(
      `download ${file.name}`,
      "⬇",
      `Download ${file.name}`,
      "link",
    ),
  ];
}

function resolveFile(token: string): FileMeta | undefined {
  return resolveFileMeta(token);
}

function buildManPage(entries: Record<string, string[]>): string[] {
  return Object.entries(entries).flatMap(([cmd, lines]) => [
    `${cmd}:`,
    ...lines.map((line) => `  ${line}`),
    "",
  ]);
}

function renderMarkdownBox(title: string, content: string): string[] {
  const lines = content.split(/\r?\n/);
  const out: string[] = [];
  let inCode = false;

  const push = (text: string = "") => out.push(`│ ${text}`);

  lines.forEach((raw) => {
    const line = raw.replace(/\s+$/, "");

    if (/^```/.test(line)) {
      inCode = !inCode;
      push(inCode ? "code:" : "");
      return;
    }

    if (inCode) {
      push(`  ${line}`);
      return;
    }

    if (/^#{1,6}\s+/.test(line)) {
      const text = line.replace(/^#{1,6}\s+/, "");
      push(text);
      push();
      return;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      push(`  • ${line.replace(/^\s*[-*]\s+/, "")}`);
      return;
    }

    if (!line.trim()) {
      push();
      return;
    }

    push(line);
  });

  const horizontal = "─".repeat(Math.max(8, title.length + 6));
  return [`┌─ ${title}`, `├${horizontal}`, ...out, `└${horizontal}`];
}

type BlogSurfaceEntry = {
  slug: string;
  title: string;
  date?: string;
  readingMinutes: number;
  tags: string[];
  summary?: string;
  body: string;
};

function toBlogSurfaceEntry(post: BlogPost): BlogSurfaceEntry {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    readingMinutes: post.readingMinutes,
    tags: post.tags,
    summary: post.summary,
    body: post.body,
  };
}

function formatReadingTime(minutes: number): string {
  const safeMinutes = Math.max(1, Math.round(minutes));
  return `${safeMinutes} min read`;
}

function getBlogSurfaceEntries(): BlogSurfaceEntry[] {
  return blogIndex.getAll().map(toBlogSurfaceEntry);
}

function findBlogSurfaceEntry(input: string): BlogSurfaceEntry | undefined {
  const indexedPost = blogIndex.findBySlugOrTitle(input);
  if (indexedPost) return toBlogSurfaceEntry(indexedPost);

  const lowered = input.toLowerCase();
  const entries = getBlogSurfaceEntries();

  return (
    entries.find((entry) => entry.slug.toLowerCase() === lowered) ||
    entries.find((entry) => entry.title.toLowerCase() === lowered) ||
    entries.find((entry) => entry.title.toLowerCase().includes(lowered))
  );
}

function searchBlogSurfaceEntries(query: string) {
  const hits = blogIndex.search(query);
  const entries = getBlogSurfaceEntries();
  const entryByKey = new Map(
    entries.map((entry) => [entry.slug, entry]),
  );

  return hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const entryA = entryByKey.get(a.slug);
    const entryB = entryByKey.get(b.slug);
    if (entryA?.date && entryB?.date) return entryB.date.localeCompare(entryA.date);
    return a.title.localeCompare(b.title);
  });
}

function listBlogSurfaceTags(): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  getBlogSurfaceEntries().forEach((entry) => {
    entry.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

function toBlogLogItem(entry: BlogSurfaceEntry, mode: "summary" | "full"): LogItem {
  return {
    date: entry.date || "",
    note: entry.title,
    readingMinutes: entry.readingMinutes,
    readingTimeLabel: formatReadingTime(entry.readingMinutes),
    body:
      mode === "full"
        ? [entry.summary, entry.body].filter(Boolean).join("\n\n")
        : entry.summary,
    slug: entry.slug,
    markdownVariant: "blog",
  };
}

export function registerDefaultCommands({
  registry,
  props,
  model,
  setLinesFromModel,
  appearanceController,
}: RegisterDefaultsArgs) {
  const fontController = appearanceController?.font;
  const colorController = appearanceController?.color;
  const contact = props.contact || {
    email: "milaforge@proton.me",
  };
  if (typeof document !== "undefined") {
    applyMotionMode(readStoredMotion());
  }

  const themes = listThemes();

  //! instead of <What did you do?> SAY:
  //! What broke, why, and how did you enforce correctness?

  const caseStudies = props.sampleWorks || SELECTED_CASES;
  const orderedCaseStudies = [...caseStudies]
    .map((item, fallbackIndex) => ({ item, fallbackIndex }))
    .sort(
      (a, b) =>
        (a.item.index ?? a.fallbackIndex) - (b.item.index ?? b.fallbackIndex),
    )
    .map(({ item }) => item);

  setSearchWorkItems(orderedCaseStudies);
  const workIndex = new Map<string, SampleWork>();
  orderedCaseStudies.forEach((item) =>
    workIndex.set(makeWorkSlug(item.title), item),
  );

  const findWorkEntry = (input: string) => {
    const token = input.toLowerCase().trim();
    return (
      workIndex.get(token) ||
      orderedCaseStudies.find((item) => {
        const slug = makeWorkSlug(item.title);
        return (
          slug === token ||
          item.title.toLowerCase() === token ||
          item.title.toLowerCase().includes(token)
        );
      })
    );
  };

  const contactEntries = [
    contact.email
      ? { label: "email", displayLabel: "✉", value: contact.email }
      : null,
  ].filter(Boolean) as {
    label: string;
    value: string;
    displayLabel?: string;
  }[];

  const historyHandler = async ({ args, model }: CommandHandlerContext) => {
    const flag = (args[0] || "").toLowerCase();

    if (flag && flag !== "-c") {
      return ["usage: history [-c]"];
    }

    if (flag === "-c") {
      model.clearHistory();
      await clearPersistedHistory();
      return ["history cleared"];
    }

    const history = model.getHistory();
    if (!history.length) return ["history: (empty)"];

    const width = (history.length + "").length;
    return history.map(
      (item, index) =>
        `${(index + 1).toString().padStart(width, " ")}  ${item}`,
    );
  };

  const blogHandler = ({ args }: CommandHandlerContext): TerminalLineInput[] => {
    const first = (args[0] || "list").toLowerCase();
    const effectiveArgs = first.startsWith("--") ? ["list", ...args] : args;
    const sub = (effectiveArgs[0] || "list").toLowerCase();

    if (sub === "list") {
      let tag: string | undefined;
      let searchTerm: string | undefined;

      for (let i = 1; i < effectiveArgs.length; i++) {
        const token = effectiveArgs[i];
        if (token === "--tag" && effectiveArgs[i + 1]) {
          tag = effectiveArgs[i + 1].toLowerCase();
          i++;
          continue;
        }
        if ((token === "--search" || token === "--q") && effectiveArgs[i + 1]) {
          searchTerm = effectiveArgs[i + 1];
          i++;
        }
      }

      let entries = getBlogSurfaceEntries();
      if (tag) {
        entries = entries.filter((entry) => entry.tags.includes(tag));
      }
      if (searchTerm) {
        const hits = searchBlogSurfaceEntries(searchTerm);
        const hitSlugs = new Set(hits.map((hit) => hit.slug));
        entries = entries.filter((entry) => hitSlugs.has(entry.slug));
      }

      if (!entries.length) {
        return [
          "blog:",
          "  no entries found" + (tag ? ` for tag '${tag}'` : ""),
          "",
          "try: blog tags",
        ];
      }

      return [
        [
          {
            type: "logs",
            items: entries.map((entry) => toBlogLogItem(entry, "full")),
          },
        ],
      ];
    }

    if (sub === "read") {
      const query = effectiveArgs.slice(1).join(" ").trim();
      if (!query) return ["usage: blog read <slug|title>"];

      const entry = findBlogSurfaceEntry(query);
      if (!entry) return [`blog entry not found: ${query}`];

      return [
        [
          {
            type: "logs",
            items: [toBlogLogItem(entry, "full")],
          },
        ],
        "",
        [
          {
            type: "markdown",
            title: entry.title,
            markdown: [entry.summary, entry.body].filter(Boolean).join("\n\n"),
            variant: "blog",
            date: entry.date,
          },
        ],
      ];
    }

    if (sub === "search") {
      const query = effectiveArgs.slice(1).join(" ").trim();
      if (!query) return ["usage: blog search <query>"];
      const hits = searchBlogSurfaceEntries(query);
      if (!hits.length) return [`no blog matches for "${query}"`];

      const lines = hits.map((hit) => {
        const summary = hit.summary ? ` — ${hit.summary}` : "";
        return `  ${hit.slug.padEnd(18)} (${hit.score}) [blog] ${hit.title}${summary}`;
      });
      return ["blog search results:", ...lines];
    }

    if (sub === "tags") {
      const tags = listBlogSurfaceTags();
      if (!tags.length) return ["no tags yet"];
      return [
        "tags:",
        ...tags.map((t) => `  ${t.tag.padEnd(16)} ${t.count}`),
      ];
    }

    return [
      "usage:",
      "  blog list [--tag t] [--search q]",
      "  blog read <slug|title>",
      "  blog search <query>",
      "  blog tags",
    ];
  };

  const blogSubcommandSuggestions = ({
    prefix,
    parts,
    hasTrailingSpace,
  }: SubcommandSuggestContext) => {
    const subToken = (parts[1] || "").toLowerCase();
    const wantsRead = subToken === "read" || prefix.toLowerCase() === "read";
    if (!wantsRead) return undefined;

    const titlePrefix =
      parts.length > 2
        ? parts.slice(2).join(" ")
        : hasTrailingSpace || prefix.toLowerCase() === "read"
          ? ""
          : prefix;

    return getBlogSurfaceEntries()
      .map((entry) => entry.title)
      .filter((title) =>
        title.toLowerCase().startsWith(titlePrefix.toLowerCase()),
      )
      .map((title) => `read ${title}`);
  };
  const blogCommandMeta = {
    desc: "blog list/read/search/tags",
    subcommands: ["list", "read", "search", "tags"],
    subcommandSuggestions: blogSubcommandSuggestions,
  };

  const helpHandler = ({
    registry: registryContext,
  }: CommandHandlerContext) => {
    const commands = [...registryContext.list()]
      .filter((c) => c.desc)
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );

    const widestName = commands.reduce(
      (max, cmd) => Math.max(max, cmd.name.length),
      0,
    );

    const rows = commands.flatMap((command, index) => {
      const desc = command.desc ? ` — ${command.desc}` : "";
      const name = command.name.padEnd(widestName);
      const line = `  • ${name} ${desc}`.trimEnd();
      const spacer = index === commands.length - 1 ? [] : [""];
      return [line, ...spacer];
    });

    return [
      "commands (A–Z):",
      ...rows,
      "",
      "tips:",
      "  ↑/↓ history",
      "  n! recalls history entry n (type Enter to run)",
      "  Tab autocomplete",
    ];
  };

  const formatOfflineLines = (status: OfflineStatus, action: string) => {
    const lines: string[] = [];

    if (!status.supported) {
      lines.push("offline unavailable: service workers not supported");
      return lines;
    }

    lines.push(`offline ${action}: ${status.cacheName || "pending"}`);
    lines.push(`network: ${status.online ? "online" : "offline"}`);

    if (status.message) {
      lines.push(status.message);
    }

    if (status.entries && status.entries.length) {
      lines.push("cached:");
      status.entries.forEach((entry: string) => lines.push(`  ${entry}`));
    } else {
      lines.push("cached: none yet");
    }

    return lines;
  };

  const searchHandler = async ({ args }: CommandHandlerContext) => {
    const rawQuery = args.join(" ");
    const query = sanitizeSearchQuery(rawQuery);

    // If no query, open modal and focus input preserving state.
    if (!query) {
      searchStore.open();
      return ["search mode opened — type in the search bar (live results)"];
    }

    const { hits, total } = await runSearch(query);
    searchStore.setQuery(query);
    searchStore.setResults(hits, total);
    searchStore.open();

    if (!hits.length) {
      return [`no matches for "${query}" (search modal open)`];
    }

    const summary = `search modal open — ${total} match${total === 1 ? "" : "es"} for "${query}"`;
    return [summary];
  };

  const files = listFiles();

  const displayFontHandler = async ({ args }: CommandHandlerContext) => {
    const tokens = [...args];
    if (tokens[0]?.toLowerCase() === "font") tokens.shift();

    if (!fontController) {
      return ["display font unavailable: font controller not initialized."];
    }

    const action = (tokens[0] || "list").toLowerCase();

    if (action === "list") return formatFontList();
    if (action === "current") {
      const current = fontController.getCurrentFont();
      return [
        "current font:",
        `  ${current.label} (${current.id})`,
        current.description ? `  ${current.description}` : "",
      ].filter(Boolean);
    }

    const targetId = action === "set" ? tokens[1] || "" : action;
    if (!targetId) return ["usage: display font <id>", ...formatFontList()];

    const option = fontController
      .listFonts()
      .find((item) => item.id.toLowerCase() === targetId.toLowerCase());

    if (!option) return [`unknown font: ${targetId}`, "try: display font list"];

    try {
      await fontController.setFont(option.id);
      return [
        `font set to ${option.label}`,
        option.description ? option.description : "",
      ].filter(Boolean);
    } catch (error) {
      return [`failed to set font: ${(error as Error).message}`];
    }
  };

  const normalizeColorId = (value: string) => {
    return value.toLowerCase();
  };

  const displayColorHandler = async ({ args }: CommandHandlerContext) => {
    const tokens = [...args];
    if (tokens[0]?.toLowerCase() === "color") tokens.shift();

    if (!colorController) {
      return ["display color unavailable: color controller not initialized."];
    }

    const action = (tokens[0] || "list").toLowerCase();

    if (action === "list") return formatColorList();
    if (action === "current") {
      const current = colorController.getCurrentColor();
      return [
        "current color:",
        `  ${current.label} (${current.id}) — ${current.group}`,
        current.description ? `  ${current.description}` : "",
      ].filter(Boolean);
    }

    const targetId = action === "set" ? tokens[1] || "" : action;
    if (!targetId) return ["usage: display color <id>", ...formatColorList()];

    const normalized = normalizeColorId(targetId);
    const option = colorController
      .listColors()
      .find((item) => item.id.toLowerCase() === normalized.toLowerCase());

    if (!option)
      return [`unknown color: ${targetId}`, "try: display color list"];

    try {
      await colorController.setColor(option.id);
      return [
        `color set to ${option.label}`,
        option.description ? option.description : "",
      ].filter(Boolean);
    } catch (error) {
      return [`failed to set color: ${(error as Error).message}`];
    }
  };

  const formatFontList = () => {
    if (!fontController) return ["display font is unavailable in this build."];

    const current = fontController.getCurrentFont();
    const items = fontController.listFonts();
    const longest = items.reduce(
      (len: number, item: TerminalFontMeta) => Math.max(len, item.id.length),
      0,
    );

    const rows = items.map((font: TerminalFontMeta) => {
      const active = font.id === current.id ? " (current)" : "";
      const desc = font.description ? ` — ${font.description}` : "";
      return `  ${font.id.padEnd(longest)}  ${font.label}${active}${desc}`;
    });

    return [
      "fonts:",
      ...rows,
      "",
      "set: display font <id>",
      "show current: display font current",
    ];
  };

  const formatColorList = () => {
    if (!colorController)
      return ["display color is unavailable in this build."];

    const current = colorController.getCurrentColor();
    const items = colorController.listColors();
    const longest = items.reduce(
      (len: number, item: TerminalColorMeta) => Math.max(len, item.id.length),
      0,
    );

    const byGroup: Record<string, TerminalColorMeta[]> = {};
    items.forEach((item) => {
      byGroup[item.group] = byGroup[item.group] || [];
      byGroup[item.group].push(item);
    });

    const lines: string[] = [];
    ["dark", "light"].forEach((group) => {
      if (!byGroup[group]) return;
      lines.push(`${group} colors:`);
      byGroup[group].forEach((color) => {
        const active = color.id === current.id ? " (current)" : "";
        const desc = color.description ? ` — ${color.description}` : "";
        lines.push(
          `  ${color.id.padEnd(longest)}  ${color.label}${active}${desc}`,
        );
      });
      lines.push("");
    });

    lines.push("set: display color <id>");
    lines.push("show current: display color current");
    return lines;
  };

  const formatThemeList = () => {
    if (!colorController || !fontController) {
      return ["themes are unavailable in this build."];
    }

    const currentColor = colorController.getCurrentColor();
    const currentFont = fontController.getCurrentFont();
    const currentTheme = matchTheme(currentColor.id, currentFont.id);
    const longest = themes.reduce(
      (len, pack) => Math.max(len, pack.id.length),
      0,
    );

    const rows = themes.map((pack) => {
      const active = currentTheme?.id === pack.id ? " (current)" : "";
      const desc = pack.description ? ` — ${pack.description}` : "";
      return `  ${pack.id.padEnd(longest)}  ${pack.label}${active}${desc}`;
    });

    return [
      "themes:",
      ...rows,
      "",
      "set: theme <id>",
      "show current: theme current",
      "tip: fine tune with display font/color",
    ];
  };

  const themeHandler = async ({ args }: CommandHandlerContext) => {
    if (!colorController || !fontController) {
      return ["themes are unavailable: appearance controller not ready."];
    }

    const action = (args[0] || "list").toLowerCase();
    if (action === "list") return formatThemeList();
    if (action === "current") {
      const activeTheme = matchTheme(
        colorController.getCurrentColor().id,
        fontController.getCurrentFont().id,
      );
      if (!activeTheme) {
        return [
          "current theme:",
          `  color: ${colorController.getCurrentColor().id}`,
          `  font: ${fontController.getCurrentFont().id}`,
          "  (custom mix)",
        ];
      }
      return [
        "current theme:",
        `  ${activeTheme.label} (${activeTheme.id})`,
        `  color: ${activeTheme.colorId}`,
        `  font: ${activeTheme.fontId}`,
        activeTheme.description ? `  ${activeTheme.description}` : "",
      ].filter(Boolean);
    }

    const targetId = action === "set" ? args[1] || "" : action;
    if (!targetId) return ["usage: theme <id>", ...formatThemeList()];

    const pack = findTheme(targetId);
    if (!pack) return [`unknown theme: ${targetId}`, ...formatThemeList()];

    try {
      await colorController.setColor(pack.colorId);
      await fontController.setFont(pack.fontId);
      return [
        `theme set to ${pack.label}`,
        `  color: ${pack.colorId}`,
        `  font: ${pack.fontId}`,
        pack.description ? `  ${pack.description}` : "",
      ].filter(Boolean);
    } catch (error) {
      return [`failed to set theme: ${(error as Error).message}`];
    }
  };

  const whoamiHandler = () => {
    const lines = [
      "Name: Milad TSX",
      "Role: Software Backend Engineer",
      "Focus: 0 -> 1 / Reliability / Infrastructure",
      "Open to collaboration",
    ];
    return [
      [
        buildAvatarSegment(lines, {
          label: "Milad TSX",
          meta: "profile",
          image: "images/ai_avatar.jpg",
        }),
      ],
    ];
  };

  registry
    .register("help", helpHandler, { desc: "show commands" })
    .alias("?", "help", { desc: "show commands (alias)" })
    .register(
      "about",
      () => {
        const aboutHeaderLines = [
          "Milad",
          "Software Engineering - Control & Reliability",
        ];
        const aboutBioLines = props.aboutLines || [
          "",
          "One goal:",
          "make the system safe to operate under failure.",
          "",
          "",
          "The rest of my daily routine goes to:",
          "",
          " - serving 🐈🐈",
          " - serving my better half 👸",
          " - an hour of walking",
          " - resting like it's the last day on earth",
          "",
        ];

        return [
          [
            buildAvatarSegment(aboutHeaderLines, {
              image: "images/ai_avatar.jpg",
              bodyLines: aboutBioLines,
              emphasizeLines: [1],
            }),
          ],
          "",
        ];
      },
      { desc: "short bio" },
    )
    .register("blog", blogHandler, blogCommandMeta)
    .register(
      "contact",
      () => {
        const lines: TerminalLineInput[] = [
          "If technical uncertainty, contractor drift, or missed deadlines are blocking progress, send me the context.",
          "",
          ...contactEntries.map((entry) =>
            buildContactRow(entry.displayLabel ?? entry.label, entry.value),
          ),
        ];

        lines.push("");

        lines.push([
          createTextSegment(" 📞 "),
          createCommandSegment("book", "Book an intro call", "Open booking calendar"),
        ]);

        lines.push("");
        return lines;
      },
      { desc: "reach out to me" },
    )
    .register(
      "book",
      () => {
        props.onBookCall?.();
        return ["Opening calendar embed…"].filter(
          Boolean,
        ) as TerminalLineInput[];
      },
      { desc: "book a meeting" },
    )
    .register(
      "chatbot",
      () => {
        openChat();
        return ["Opening chatbot…", "Tip: Esc to minimize"];
      },
      { desc: "Chat with my resume! [Beta]" },
    )
    .register(
      "selected_cases",
      ({ args }) => {
        const action = (args[0] || "list").toLowerCase();

        if (action === "list" || !args.length) {
          return [
            [
              {
                type: "work",
                items: orderedCaseStudies,
                clientProof: selectedCasesClientProof,
              },
            ],
          ];
        }

        if (action === "read") {
          const target = args.slice(1).join(" ").trim();
          if (!target) return ["usage: selected_cases read <title|slug>"];
          const entry = findWorkEntry(target);
          if (!entry) return [`no selected case found for "${target}"`];
          return [
            [
              {
                type: "work",
                items: [entry],
                clientProof: selectedCasesClientProof,
                initialOpenIndex: 0,
              },
            ],
          ];
        }

        return [
          "usage: selected_cases [list] | selected_cases read <title|slug>",
        ];
      },
      { desc: "selected work", subcommands: ["list", "read"] },
    )
    .register(
      "services",
      ({ args }) => {
        const target = args.join(" ").trim().toLowerCase();

        if (!target || target === "list") {
          return [
            [
              {
                type: "services",
                intro: SERVICES_INTRO,
                services: SERVICES,
              },
            ],
          ];
        }

        const match = findService(target);
        if (!match) {
          return [
            `no service found for "${target}"`,
            "",
            "available:",
            ...SERVICES.map((service) => `  ${service.id}`),
          ];
        }

        return [
          [
            {
              type: "services",
              services: SERVICES,
              initialServiceId: match.id,
            },
          ],
        ];
      },
      {
        desc: "what I can do for you",
        subcommands: SERVICES.map((service) => service.id),
        subcommandSuggestions: ({ prefix, parts }) => {
          const token = (parts[1] || prefix || "").toLowerCase();
          const ids = SERVICES.map((service) => service.id);
          if (!token) return ids;
          return ids.filter((id) => id.startsWith(token));
        },
      },
    )
    .register(
      "activity",
      () => {
        return [
          [
            {
              type: "activityTree",
              title: "Activity tree",
              nodes: ACTIVITY_TREE_NODES,
            },
          ],
        ];
      },
      { desc: "show tree-style activity timeline" },
    )
    .register("pwd", ({ model }) => [model.getCwd()], {
      desc: "print working directory",
    })
    .register(
      "cd",
      ({ args, model }) => {
        const next = normalizePath(args[0] || "", model.getCwdParts());
        if (!next) return ["usage: cd <directory>"];

        if (isDir(next, HOME_DIR) || isDir(next, FILES_DIR)) {
          model.setCwd(next);
          return [`${model.getCwd()}`];
        }

        return [`cd: no such file or directory: ${args[0] || ""}`];
      },
      { desc: "change directory (home, home/files)" },
    )
    .register(
      "ls",
      ({ model }) => {
        const cwd = model.getCwdParts();
        const atHome = isDir(cwd, HOME_DIR);
        const atFiles = isDir(cwd, FILES_DIR);

        if (atHome || atFiles) {
          if (!files.length) return ["(no files in files/ yet)"];
          return ["./files", ...files.map((file) => formatFileRow(file))];
        }

        return ["ls: unsupported directory"];
      },
      { desc: "list downloadable files" },
    )
    .register("search", searchHandler, {
      desc: "search blogs, selected cases, and resume text",
      subcommands: [],
    })
    .alias("grep", "search", { desc: "alias for search" })
    .register(
      "cat",
      async ({ args, model }) => {
        const target =
          resolveFileFromPath(
            args[0] || "",
            model.getCwdParts(),
            resolveFile,
          ) || resolveFile(args[0] || "");
        if (!target) return ["usage: cat <filename>", "try: ls"];
        if (!target.text) {
          return [`${target.name} is binary; try open or download instead.`];
        }
        try {
          const text = await getTextForFile(target);
          const lines = text.split(/\r?\n/);
          return [`--- ${target.name} ---`, ...lines];
        } catch (error) {
          return [
            `cat failed for ${target.name}: ${(error as Error)?.message || "fetch error"
            }`,
          ];
        }
      },
      { desc: "print a text file from /files" },
    )
    .register(
      "open",
      ({ args, model }) => {
        const target =
          resolveFileFromPath(
            args[0] || "",
            model.getCwdParts(),
            resolveFile,
          ) || resolveFile(args[0] || "");
        if (!target) return ["usage: open <filename>", "try: ls"];
        window.open(target.path, "_blank", "noopener,noreferrer");
        return [`opening ${target.path} in a new tab...`];
      },
      { desc: "open file in browser tab" },
    )
    .register(
      "download",
      ({ args, model }) => {
        const target =
          resolveFileFromPath(
            args[0] || "",
            model.getCwdParts(),
            resolveFile,
          ) || resolveFile(args[0] || "");
        if (!target) return ["usage: download <filename>", "try: ls"];

        // Use the actual filename from the path so downloads keep their real name.
        const downloadName =
          target.path.split("/").filter(Boolean).pop() || target.name;

        const verifyToken = args[0] || target.name;
        const updated = formatMtime(target.mtime);

        const link = document.createElement("a");
        link.href = target.path;
        link.download = downloadName;
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        const integrityLine: LineSegment[] = [
          createTextSegment("sha256 "),
          createCopySegment(target.sha256, "copy hash"),
          createTextSegment(`  ${formatBytes(target.size)}`),
        ];

        if (updated) {
          integrityLine.push(createTextSegment(`  updated ${updated}`));
        }

        const verifyLine: LineSegment[] = [
          createTextSegment("verify: "),
          createCommandSegment(
            `verify ${verifyToken}`,
            `verify ${verifyToken}`,
            `Verify ${verifyToken}`,
            "link",
          ),
        ];

        return [`downloading ${downloadName}...`, integrityLine, verifyLine];
      },
      { desc: "download file from /files" },
    )
    .register(
      "verify",
      async ({ args, model }) => {
        const target =
          resolveFileFromPath(
            args[0] || "",
            model.getCwdParts(),
            resolveFile,
          ) || resolveFile(args[0] || "");
        if (!target) return ["usage: verify <filename>", "try: ls"];
        try {
          const resp = await fetch(target.path, { cache: "no-cache" });
          if (!resp.ok) throw new Error(`fetch failed (${resp.status})`);
          const buf = await resp.arrayBuffer();
          const actual = await computeSha256(buf);
          const match = actual === target.sha256;
          return [
            `verify ${target.name}`,
            `  path: ${target.path}`,
            `  size: ${formatBytes(target.size)}`,
            `  expected: ${target.sha256}`,
            `  actual:   ${actual}`,
            match ? "✅ hash match" : "✗ hash mismatch",
          ];
        } catch (error) {
          return [
            `verify failed for ${target.name}: ${(error as Error)?.message || "fetch error"
            }`,
          ];
        }
      },
      { desc: "show SHA256 for a file" },
    )
    .register(
      "copy",
      async ({ args }) => {
        const field = (args[0] || "").toLowerCase();
        const entry = contactEntries.find(
          (item) => item.label.toLowerCase() === field,
        );
        if (!entry) return ["usage: copy email|github"];
        await copyToClipboard(entry.value);
        return [`copied ${entry.label} to clipboard`];
      },
      { desc: "copy contact info" },
    )
    .register(
      "faq",
      () => {
        return [
          [
            {
              type: "faq",
              items: FAQ_ITEMS,
            },
          ],
        ];
      },
      { desc: "interactive FAQ" },
    )
    .register("whoami", whoamiHandler, { desc: "show profile card" })
    .register("theme", themeHandler, {
      desc: "apply a bundled theme (font + color)",
      subcommands: ["list", "current", ...themes.map((pack) => pack.id)],
      subcommandSuggestions: ({ prefix, parts }) => {
        const token = (parts[1] || prefix || "").toLowerCase();
        if (!token) return ["list", "current", ...themes.map((p) => p.id)];
        return themes
          .map((pack) => pack.id)
          .filter((id) => id.toLowerCase().startsWith(token));
      },
    })
    .register(
      "display",
      async (ctx) => {
        const scope = (ctx.args[0] || "").toLowerCase();
        if (!scope || scope === "font") {
          return displayFontHandler({
            ...ctx,
            args: scope ? ctx.args.slice(1) : ctx.args,
          });
        }
        if (scope === "color") {
          return displayColorHandler({ ...ctx, args: ctx.args.slice(1) });
        }
        return ["usage: display font|color [list|current|<id>]"];
      },
      {
        desc: "display settings (font/color)",
        subcommands: ["font", "color"],
        subcommandSuggestions: ({ parts }) => {
          const first = (parts[1] || "").toLowerCase();

          if (!first) return ["font", "color"];

          if (first === "font") {
            if (!fontController) return [];
            const prefix = (parts[2] || "").toLowerCase();
            return fontController
              .listFonts()
              .map((f: TerminalFontMeta) => f.id)
              .filter((id: string) => id.toLowerCase().startsWith(prefix))
              .map((id) => `font ${id}`);
          }

          if (first === "color") {
            if (!colorController) return [];
            const prefix = (parts[2] || "").toLowerCase();
            return colorController
              .listColors()
              .map((t: TerminalColorMeta) => t.id)
              .filter((id: string) => id.toLowerCase().startsWith(prefix))
              .map((id) => `color ${id}`);
          }

          return [];
        },
      },
    )
    .register(
      "motion",
      ({ args }) => {
        const input = (args[0] || "status").toLowerCase();
        const normalize = (token: string): MotionMode | "status" | null => {
          if (!token || token === "status") return "status";
          if (token === "reduce" || token === "off") return "reduce";
          if (token === "allow" || token === "on") return "allow";
          if (token === "auto" || token === "system") return "auto";
          return null;
        };

        const mode = normalize(input);
        if (mode === null) {
          return ["usage: motion status|reduce|allow|auto"];
        }

        if (typeof document === "undefined") {
          return ["motion: unavailable in this environment"];
        }

        if (mode !== "status") {
          writeStoredMotion(mode);
          applyMotionMode(mode);
        }

        const stored = readStoredMotion();
        const systemPrefers = prefersReducedMotion();
        const active =
          document.documentElement.classList.contains("motion-reduce");

        return [
          `motion mode: ${stored}`,
          `system prefers-reduced-motion: ${systemPrefers ? "reduce" : "no preference"}`,
          `active setting: ${active ? "reduced motion" : "full motion"}`,
          "use: motion reduce | motion allow | motion auto",
        ];
      },
      {
        desc: "motion status | reduce | allow | auto (respects prefers-reduced-motion)",
        subcommands: ["status", "reduce", "allow", "auto"],
      },
    )
    .register(
      "resume",
      () => {
        const target = findFileByName("cv.pdf");
        if (!target) return ["resume not found; try ls"];
        window.open(target.path, "_blank", "noopener,noreferrer");
        return [`opening ${target.name}...`];
      },
      { desc: "open resume.pdf in new tab" },
    )
    .register("ver", () => [`version: ${APP_VERSION}`], {
      desc: "show app version",
    })
    .register(
      "man",
      ({ args }) => {
        const topic = (args[0] || "").toLowerCase();
        const pages: Record<string, string[]> = {
          pwd: ["print current directory (virtual)"],
          ls: ["list files from /files", "ls"],
          cat: ["cat <file> — print text files only"],
          grep: ["grep <term> — unified search (alias of search)"],
          search: [
            "search <term> — unified search across selected cases, blogs, and resume text",
            "Cmd/Ctrl+F pre-fills the search prompt",
          ],
          selected_cases: [
            "selected_cases [list] — show selected case studies",
            "selected_cases read <slug|title> — open a selected case",
          ],
          services: [
            "services — browse the types of engagements I take on",
            "services <id> — jump straight to one service",
          ],
          open: ["open <file> — open in new tab"],
          download: ["download <file> — trigger browser download"],
          verify: [
            "verify <file> — compute SHA256 locally, compare to manifest",
          ],
          copy: ["copy email — copy to clipboard"],
          whoami: ["compact profile card; alias: finger"],
          resume: ["open resume PDF"],
          ver: ["ver — show app version"],
          blog: [
            "blog list [--tag t] [--search q] — show blog entries and engineering notes",
            "blog read <slug|title> — open an entry",
            "blog search <query> — ranked search",
            "blog tags — show tag counts",
          ],
          activity: [
            "activity — show a tree/timeline style overview of selected cases and focus areas",
          ],
          faq: ["faq — interactive Q&A accordion (click to expand)"],
          history: [
            "history — list commands",
            "history -c — clear history",
            "n! — load nth history entry into input (press Enter to execute)",
          ],
          offline: ["offline status|refresh|disable — manage SW cache"],
          display: [
            "display font list — show available fonts",
            "display font current — show active font",
            "display font <id> — switch terminal font",
            "display color list — show dark/light colors",
            "display color current — show active color",
            "display color <id> — switch terminal colors",
          ],
          theme: [
            "theme list — show bundled font+color presets",
            "theme current — show active preset (or custom)",
            "theme <id> — apply preset (updates font + theme)",
          ],
          motion: [
            "motion status — show whether reduced motion is active",
            "motion reduce — force low-motion mode",
            "motion allow — force full-motion mode",
            "motion auto — follow OS prefers-reduced-motion",
          ],
        };

        if (topic && pages[topic]) {
          return buildManPage({ [topic]: pages[topic] });
        }
        return [
          "man pages:",
          ...Object.keys(pages).map((name) => `  ${name}`),
          "",
          "usage: man <command>",
        ];
      },
      { desc: "man <command>" },
    )
    .register("history", historyHandler, {
      desc: "show or clear command history (history -c)",
      subcommands: ["-c"],
    })
    .register(
      "clear",
      () => {
        model.clear();
        setLinesFromModel();
        return [];
      },
      { desc: "clear the screen" },
    )
    .register(
      "offline",
      async ({ args }) => {
        const subcommand = (args[0] || "status").toLowerCase();

        if (subcommand === "status") {
          const status = await getOfflineStatus();
          return formatOfflineLines(status, "status");
        }

        if (subcommand === "refresh") {
          const status = await refreshOfflineResources();
          return formatOfflineLines(status, "refresh");
        }

        if (subcommand === "disable") {
          const status = await disableOffline();
          return formatOfflineLines(status, "disable");
        }

        return ["usage: offline status|refresh|disable"];
      },
      {
        desc: "offline status | refresh cache | disable (clear sw/cache/IndexedDB)",
        subcommands: ["status", "refresh", "disable"],
      },
    )
    .register("assumptions", async () => {
      return [
        `
      I do not treat automation as a shortcut around engineering judgment.

      I believe:
      - most problems are underspecified
      - most failures come from bad framing, not bad code
      - speed without auditability is technical debt with interest

      Useful systems make decisions visible, retry safely,
      and leave enough evidence for the next operator.
      `,
        [
          createTextSegment(" 📞 "),
          createCommandSegment("book", "Face to Face", "Open booking calendar"),
        ],
      ];
    })
    .register("constraints", async () => {
      return [
        `
      Constraints I operate under (by choice):

      - I don’t ship code I can’t explain or unwind
      - I bias toward boring primitives over clever abstractions
      - I assume systems will be misused

      This makes me slower on day 1
      and faster on day 100.
      `,
      ];
    })
    .register("philosophy", async () => {
      return [
        `
      Autonomy without accountability is just automation debt.

      Every agent should:
      - explain itself
      - show its work
      - accept being stopped

      Good automation should make work faster without making outcomes harder to trust.
      `,
      ];
    })
    .register("bias", async () => {
      return [
        `
          I assume systems will fail.

          I design for:
            - partial information
            - bad inputs
            - silent errors
            - human fatigue

          This makes me slower at demos
          and faster in production.
      `,
      ];
    });

  // Easter Eggs
}
