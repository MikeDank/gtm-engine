import type { Connector, ConnectorResult, NormalizedSignal } from "@/core/types";

interface GitHubPR {
  number: number;
  title: string;
  html_url: string;
  merged_at: string | null;
  user: { login: string } | null;
  body: string | null;
}

async function fetchMergedPRs(owner: string, repo: string): Promise<GitHubPR[]> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error(
      "GITHUB_TOKEN environment variable is required. Set it in your .env file or export it in your shell."
    );
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=20`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  const pulls = (await response.json()) as GitHubPR[];
  return pulls.filter((pr) => pr.merged_at !== null);
}

function prToSignal(pr: GitHubPR): NormalizedSignal {
  const excerpt = `[PR #${pr.number}] ${pr.title}${pr.user ? ` by @${pr.user.login}` : ""}`;

  return {
    source: pr.html_url,
    excerpt: excerpt.slice(0, 500),
    status: "pending",
    capturedAt: new Date(pr.merged_at!),
  };
}

export const githubConnector: Connector = {
  name: "github",

  async ingest(input: string): Promise<ConnectorResult> {
    const [owner, repoName] = input.split("/");

    if (!owner || !repoName) {
      throw new Error(
        "Invalid repo format. Use owner/repo (e.g., facebook/react)"
      );
    }

    const mergedPRs = await fetchMergedPRs(owner, repoName);
    const signals = mergedPRs.map(prToSignal);

    return {
      signals,
      meta: {
        source: `github:${owner}/${repoName}`,
        fetchedAt: new Date(),
        itemCount: signals.length,
      },
    };
  },
};
