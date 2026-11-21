import * as React from "react";
import { StarIcon } from "@heroicons/react/16/solid";
import { Button } from "@deyloom/react";

const REPO_URL = "https://github.com/dm192/DeyloomUI";
const API_URL = "https://api.github.com/repos/dm192/DeyloomUI";
const CACHE_KEY = "deyloom:github-stars";
/** Unauthenticated GitHub API is limited to 60 requests/hour per IP. */
const CACHE_TTL = 30 * 60 * 1000;
const FETCH_TIMEOUT = 5000;

interface StarCache {
  count: number;
  fetchedAt: number;
}

function readCache(): StarCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StarCache>;
    if (typeof parsed.count !== "number" || typeof parsed.fetchedAt !== "number") return null;
    return { count: parsed.count, fetchedAt: parsed.fetchedAt };
  } catch {
    return null;
  }
}

function writeCache(count: number): void {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ count, fetchedAt: Date.now() }));
  } catch {
    /* storage disabled: the icon still works, we just re-fetch next time */
  }
}

function formatStars(count: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count);
}

/** Official Octocat mark. Heroicons deliberately ships no brand logos. */
function GitHubMark(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/**
 * Repo link in the top bar with a live star count.
 *
 * Data flow: cached count renders immediately, then (if older than 30 minutes)
 * a background request refreshes it. Any failure — offline, rate limited, 404 on
 * a repo that does not exist yet — degrades to the icon-only link: no layout
 * shift, no placeholder number and no console noise.
 */
export function GitHubLink() {
  const [stars, setStars] = React.useState<number | null>(() => readCache()?.count ?? null);

  React.useEffect(() => {
    const cached = readCache();
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    fetch(API_URL, {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: unknown) => {
        const count = (data as { stargazers_count?: unknown } | null)?.stargazers_count;
        if (typeof count === "number" && Number.isFinite(count)) {
          setStars(count);
          writeCache(count);
        }
      })
      .catch(() => {
        /* keep whatever the cache gave us; the link still works without a count */
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const label = stars === null ? "GitHub 仓库" : `GitHub 仓库，${stars} 个 star`;

  return (
    <Button asChild variant="outline" tone="neutral" size="sm" className="github-link">
      <a
        href={REPO_URL}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={label}
        data-testid="github-link"
      >
        <GitHubMark className="github-link__mark" />
        {stars !== null ? (
          <span className="github-link__count" aria-hidden="true">
            <StarIcon className="github-link__star" />
            {formatStars(stars)}
          </span>
        ) : null}
      </a>
    </Button>
  );
}
