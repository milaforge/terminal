export type AppRoute =
  | { name: "home" }
  | { name: "team" }
  | { name: "book"; slug?: string; legacy?: boolean };

type LocationLike = {
  hash?: string;
  origin: string;
  pathname: string;
  search?: string;
};

type NavigationClickLike = {
  button: number;
  ctrlKey?: boolean;
  defaultPrevented?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
};

function cleanBasePath(base: string) {
  if (!base || base === "/") return "";
  return base.replace(/\/$/, "");
}

function safeDecodePathPart(part?: string) {
  if (!part) return undefined;
  try {
    return decodeURIComponent(part);
  } catch {
    return part;
  }
}

function pathInsideBase(pathname: string, base: string) {
  const cleanBase = cleanBasePath(base);
  return (
    !cleanBase ||
    pathname === cleanBase ||
    pathname.startsWith(`${cleanBase}/`)
  );
}

function appRoutePathname(route: AppRoute, base: string) {
  if (route.name === "book") {
    return withBasePath(
      route.slug ? `/book/${encodeURIComponent(route.slug)}/` : "/book/",
      base,
    );
  }

  if (route.name === "team") {
    return withBasePath("/team/", base);
  }

  return withBasePath("/", base);
}

export function withBasePath(
  path: string,
  base = import.meta.env.BASE_URL || "/",
) {
  const cleanBase = cleanBasePath(base);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${normalizedPath}`;
}

export function parseAppRoute(
  pathname: string,
  base = import.meta.env.BASE_URL || "/",
): AppRoute {
  const cleanBase = cleanBasePath(base);
  const path =
    cleanBase && pathInsideBase(pathname, base)
      ? pathname.slice(cleanBase.length) || "/"
      : pathname;
  const parts = path.split("/").filter(Boolean);

  if (parts[0] === "book" || parts[0] === "blog") {
    return {
      name: "book",
      slug: safeDecodePathPart(parts[1]),
      legacy: parts[0] === "blog",
    };
  }

  if (parts[0] === "team") {
    return { name: "team" };
  }

  return { name: "home" };
}

export function getClientRoutePath(
  href: string,
  current: LocationLike,
  base = import.meta.env.BASE_URL || "/",
) {
  const currentUrl = `${current.origin}${current.pathname}${current.search || ""}${current.hash || ""}`;
  let target: URL;

  try {
    target = new URL(href, currentUrl);
  } catch {
    return null;
  }

  if (target.origin !== current.origin) return null;
  if (!pathInsideBase(target.pathname, base)) return null;

  const currentSearch = current.search || "";
  const currentHash = current.hash || "";
  if (
    target.pathname === current.pathname &&
    target.search === currentSearch &&
    target.hash === currentHash
  ) {
    return null;
  }

  const route = parseAppRoute(target.pathname, base);
  const cleanBase = cleanBasePath(base);
  const isHomeRoute =
    target.pathname === withBasePath("/", base) || target.pathname === cleanBase;
  if (
    route.name !== "book" &&
    route.name !== "team" &&
    !isHomeRoute
  ) {
    return null;
  }

  return `${appRoutePathname(route, base)}${target.search}${target.hash}`;
}

export function getClientRoutePathForClick(
  event: NavigationClickLike,
  href: string,
  target: string | null | undefined,
  download: boolean,
  current: LocationLike,
  base = import.meta.env.BASE_URL || "/",
) {
  if (event.defaultPrevented) return null;
  if (event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return null;
  }
  if (download) return null;
  if (target && target.toLowerCase() !== "_self") return null;

  let targetUrl: URL;
  try {
    targetUrl = new URL(href, `${current.origin}${current.pathname}`);
  } catch {
    return null;
  }

  if (
    targetUrl.pathname === current.pathname &&
    targetUrl.search === (current.search || "") &&
    targetUrl.hash &&
    targetUrl.hash !== (current.hash || "")
  ) {
    return null;
  }

  const routePath = getClientRoutePath(href, current, base);
  if (routePath) return routePath;

  if (
    targetUrl.origin === current.origin &&
    targetUrl.pathname === current.pathname &&
    targetUrl.search === (current.search || "") &&
    targetUrl.hash === (current.hash || "") &&
    pathInsideBase(targetUrl.pathname, base)
  ) {
    const route = parseAppRoute(targetUrl.pathname, base);
    const cleanBase = cleanBasePath(base);
    const isHomeRoute =
      targetUrl.pathname === withBasePath("/", base) ||
      targetUrl.pathname === cleanBase;
    if (route.name === "book" || isHomeRoute) {
      return `${appRoutePathname(route, base)}${targetUrl.search}${targetUrl.hash}`;
    }

    if (route.name === "team") {
      return `${appRoutePathname(route, base)}${targetUrl.search}${targetUrl.hash}`;
    }
  }

  return null;
}
