import { profile } from "./data";

export type RepoStat = {
  name: string;
  stars: number;
  language: string | null;
  pushedAt: string;
  url: string;
};

export type GitHubSnapshot = {
  repos: Record<string, RepoStat>;
  publicRepos: number;
  followers: number;
  since: string;
  ok: boolean;
};

const empty: GitHubSnapshot = { repos: {}, publicRepos: 11, followers: 0, since: "2024", ok: false };

export async function getGitHub(): Promise<GitHubSnapshot> {
  try {
    const opts = { next: { revalidate: 3600 }, headers: { Accept: "application/vnd.github+json" } };
    const [u, r] = await Promise.all([
      fetch(`https://api.github.com/users/${profile.githubUser}`, opts),
      fetch(`https://api.github.com/users/${profile.githubUser}/repos?per_page=100&sort=pushed`, opts),
    ]);
    if (!u.ok || !r.ok) return empty;
    const user = await u.json();
    const list = (await r.json()) as Array<{
      name: string; stargazers_count: number; language: string | null; pushed_at: string; html_url: string;
    }>;
    const repos: Record<string, RepoStat> = {};
    for (const x of list)
      repos[x.name] = { name: x.name, stars: x.stargazers_count, language: x.language, pushedAt: x.pushed_at, url: x.html_url };
    return {
      repos,
      publicRepos: user.public_repos,
      followers: user.followers,
      since: String(new Date(user.created_at).getFullYear()),
      ok: true,
    };
  } catch {
    return empty;
  }
}
