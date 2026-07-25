import type { ProblemRecord, SolutionMetadata, Submission, VaultStats } from "@codevault/types";

export interface GitHubCommitOptions {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
}

export class GitHubSyncEngine {
  private token: string;
  private owner: string;
  private repo: string;
  private branch: string;
  private baseUrl = "https://api.github.com";

  constructor(options: GitHubCommitOptions) {
    this.token = options.token;
    this.owner = options.owner;
    this.repo = options.repo;
    this.branch = options.branch || "main";
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `GitHub API error: ${res.status}`);
    }

    return res.json();
  }

  async getRepositoryInfo() {
    return this.request<{ name: string; private: boolean; default_branch: string }>(
      `/repos/${this.owner}/${this.repo}`
    );
  }

  async fetchFileContent(path: string): Promise<{ content: string; sha: string } | null> {
    try {
      const data = await this.request<{ content: string; sha: string }>(
        `/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`
      );
      const decoded = atob(data.content.replace(/\n/g, ""));
      return { content: decoded, sha: data.sha };
    } catch {
      return null;
    }
  }

  async uploadFile(path: string, content: string, message: string, sha?: string) {
    const encoded = btoa(unescape(encodeURIComponent(content)));
    return this.request(`/repos/${this.owner}/${this.repo}/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: encoded,
        branch: this.branch,
        ...(sha ? { sha } : {}),
      }),
    });
  }
}
