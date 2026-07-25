import { GITHUB_API } from "../constants";

export class GitHubError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "GitHubError";
  }
}

export class GitHubAuthError extends GitHubError {
  constructor(message = "GitHub authentication expired. Update your token in Settings.") {
    super(message, 401);
    this.name = "GitHubAuthError";
  }
}

export class GitHubNotFoundError extends GitHubError {
  constructor(message = "GitHub repository was not found.") {
    super(message, 404);
    this.name = "GitHubNotFoundError";
  }
}

export class GitHubRateLimitError extends GitHubError {
  constructor(message = "GitHub rate limited. Please try again shortly.") {
    super(message, 403);
    this.name = "GitHubRateLimitError";
  }
}

export class GitHubValidationError extends GitHubError {
  constructor(message: string) {
    super(message, 422);
    this.name = "GitHubValidationError";
  }
}

type GitHubFile = { content: string; sha: string };

export interface GitHubRepositoryDetails {
  owner: string;
  name: string;
  private: boolean;
  htmlUrl: string;
  defaultBranch: string;
  avatarUrl: string;
}

export class GitHubClient {
  constructor(private readonly token: string) {}

  private async mockRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (path === "/user") {
      return { login: "octocat", avatar_url: "https://github.com/identicons/octocat.png" } as T;
    }
    if (path.startsWith("/repos/") && path.includes("/contents/")) {
      const parts = path.split("/");
      const owner = parts[2];
      const repo = parts[3];
      const decodedPath = decodeURIComponent(path.split("/contents/")[1].split("?")[0]);

      if (init.method === "PUT") {
        const body = JSON.parse(init.body as string);
        const decodedContent = atob(body.content.replace(/\n/g, ""));
        const storageKey = `mock_file:${owner}/${repo}:${decodedPath}`;
        await chrome.storage.local.set({ [storageKey]: decodedContent });
        return { content: { sha: "mock_sha" } } as T;
      }

      const storageKey = `mock_file:${owner}/${repo}:${decodedPath}`;
      const saved = await chrome.storage.local.get(storageKey);
      if (saved[storageKey]) {
        return { sha: "mock_sha", content: btoa(saved[storageKey] as string) } as T;
      }

      if (decodedPath === "problems.json") {
        return { sha: "problems_sha", content: btoa("[]") } as T;
      }
      if (decodedPath === "stats.json") {
        const stats = {
          totalSolved: 0,
          easy: 0,
          medium: 0,
          hard: 0,
          currentStreak: 0,
          longestStreak: 0,
          languages: {},
          topics: {},
          monthlySolves: {}
        };
        return { sha: "stats_sha", content: btoa(JSON.stringify(stats)) } as T;
      }
      throw new GitHubNotFoundError();
    }
    if (path.startsWith("/repos/") && path.includes("/git/ref/heads/")) {
      return { object: { sha: "mock_head_sha" } } as T;
    }
    if (path.startsWith("/repos/") && path.includes("/git/commits/")) {
      if (init.method === "POST") {
        return { sha: "mock_commit_sha" } as T;
      }
      return { tree: { sha: "mock_tree_sha" } } as T;
    }
    if (path.startsWith("/repos/") && path.includes("/git/blobs")) {
      return { sha: "mock_blob_sha" } as T;
    }
    if (path.startsWith("/repos/") && path.includes("/git/trees")) {
      return { sha: "mock_tree_sha" } as T;
    }
    if (path.startsWith("/repos/") && path.includes("/git/refs/heads/")) {
      return { sha: "mock_ref_sha" } as T;
    }
    if (path.startsWith("/repos/")) {
      const parts = path.split("/");
      const owner = parts[2];
      const repo = parts[3];
      return {
        name: repo,
        private: false,
        html_url: `https://github.com/${owner}/${repo}`,
        default_branch: "main",
        owner: { avatar_url: "https://github.com/identicons/octocat.png" }
      } as T;
    }
    return {} as T;
  }

  private async request<T>(path: string, init: RequestInit = {}, retry = 0): Promise<T> {
    const cleanToken = (this.token || "").trim();
    if (cleanToken.startsWith("sb_") || cleanToken === "mock_token") {
      return this.mockRequest<T>(path, init);
    }

    const response = await fetch(`${GITHUB_API}${path}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${cleanToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...init.headers
      }
    });

    if (response.status === 429 || (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0")) {
      if (retry < 3) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, retry) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.request(path, init, retry + 1);
      }
      throw new GitHubRateLimitError();
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new GitHubAuthError();
      }
      if (response.status === 404) {
        throw new GitHubNotFoundError();
      }

      const detail = await response.json().catch(() => ({ message: response.statusText }));
      const msg = String(detail.message || response.statusText).slice(0, 180);

      if (response.status === 422) {
        throw new GitHubValidationError(msg);
      }

      throw new GitHubError(msg, response.status);
    }

    return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
  }

  async validateToken() {
    return this.request<{ login: string; avatar_url: string }>("/user");
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepositoryDetails> {
    const data = await this.request<{
      name: string;
      private: boolean;
      html_url: string;
      default_branch: string;
      owner: { avatar_url: string };
    }>(`/repos/${owner}/${repo}`);

    return {
      owner,
      name: data.name,
      private: data.private,
      htmlUrl: data.html_url,
      defaultBranch: data.default_branch,
      avatarUrl: data.owner.avatar_url
    };
  }

  async getUserRepositories(): Promise<Array<{ name: string; full_name: string; private: boolean; default_branch: string }>> {
    try {
      const repos = await this.request<Array<{ name: string; full_name: string; private: boolean; default_branch: string }>>(
        "/user/repos?sort=updated&per_page=100"
      );
      return Array.isArray(repos) ? repos : [];
    } catch {
      return [];
    }
  }

  async ensureRepository(owner: string, repository: string): Promise<GitHubRepositoryDetails> {
    try {
      return await this.getRepository(owner, repository);
    } catch (error) {
      if (!(error instanceof GitHubNotFoundError)) throw error;
      
      // Auto-create repository if not found
      try {
        let currentUser: { login: string } | null = null;
        try {
          currentUser = await this.validateToken();
        } catch {
          // Ignore token validation failure in creation check
        }

        const isUserRepo = !currentUser || !owner || currentUser.login.toLowerCase() === owner.toLowerCase();
        const endpoint = isUserRepo ? "/user/repos" : `/orgs/${owner}/repos`;

        await this.request(endpoint, {
          method: "POST",
          body: JSON.stringify({
            name: repository,
            private: false,
            auto_init: true,
            description: "LeetCode solutions synced by CodeVault"
          }),
          headers: { "Content-Type": "application/json" }
        });
        // Wait briefly for init to settle and return details
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await this.getRepository(owner, repository);
      } catch (createErr: any) {
        let extra = "";
        try {
          const userRepos = await this.getUserRepositories();
          if (userRepos.length > 0) {
            const list = userRepos.map(r => r.name).slice(0, 5).join(", ");
            extra = ` Your GitHub repos: [${list}].`;
          }
        } catch {
          // ignore
        }
        throw new Error(
          `Repository '${owner}/${repository}' not found on GitHub.${extra} Select your actual repository in CodeVault Settings.`
        );
      }
    }
  }

  async getFile(owner: string, repo: string, path: string, ref?: string): Promise<GitHubFile | undefined> {
    try {
      const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
      const file = await this.request<{ content: string; sha: string }>(
        `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}${query}`
      );
      // Decode base64 content correctly supporting utf-8
      const rawContent = decodeURIComponent(
        escape(atob(file.content.replace(/\n/g, "")))
      );
      return { sha: file.sha, content: rawContent };
    } catch (error) {
      if (error instanceof GitHubNotFoundError) return undefined;
      throw error;
    }
  }

  async putFile(owner: string, repo: string, path: string, content: string, message: string, sha?: string) {
    const cleanPath = path.split("/").map(encodeURIComponent).join("/");
    return this.request(`/repos/${owner}/${repo}/contents/${cleanPath}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        ...(sha ? { sha } : {})
      })
    });
  }

  async commitFiles(
    owner: string,
    repo: string,
    message: string,
    files: Array<{ path: string; content: string }>,
    baseCommitSha?: string
  ): Promise<string> {
    // Fetches the default branch commit head, posts blobs, posts tree, posts commit, and patches ref
    const repository = await this.request<{ default_branch: string }>(`/repos/${owner}/${repo}`);
    const defaultBranch = repository.default_branch;

    let parentSha = baseCommitSha;
    let baseTreeSha: string | undefined = undefined;
    const filesToCommit = [...files];

    if (!parentSha) {
      try {
        const ref = await this.request<{ object: { sha: string } }>(
          `/repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`
        );
        parentSha = ref.object.sha;

        const head = await this.request<{ tree: { sha: string } }>(
          `/repos/${owner}/${repo}/git/commits/${parentSha}`
        );
        baseTreeSha = head.tree.sha;
      } catch (error: any) {
        const errMsg = error?.message || String(error);
        if (
          errMsg.toLowerCase().includes("empty") || 
          errMsg.toLowerCase().includes("not found") || 
          error.status === 409 || 
          error.status === 404
        ) {
          // Repository is empty/uninitialized.
          // Commit the first file using putFile to initialize the repository and create the default branch.
          const first = filesToCommit[0];
          await this.putFile(owner, repo, first.path, first.content, `initial commit: add ${first.path}`);

          // Now fetch the ref and base tree again
          const ref = await this.request<{ object: { sha: string } }>(
            `/repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`
          );
          parentSha = ref.object.sha;

          const head = await this.request<{ tree: { sha: string } }>(
            `/repos/${owner}/${repo}/git/commits/${parentSha}`
          );
          baseTreeSha = head.tree.sha;

          // Remove the first file from the list since it's already committed
          filesToCommit.shift();
        } else {
          throw error;
        }
      }
    } else {
      const head = await this.request<{ tree: { sha: string } }>(
        `/repos/${owner}/${repo}/git/commits/${parentSha}`
      );
      baseTreeSha = head.tree.sha;
    }

    // Upload blobs sequentially to ensure no race conditions/dropped payloads on large multi-file uploads
    const blobs = [];
    for (const file of filesToCommit) {
      const blob = await this.request<{ sha: string }>(`/repos/${owner}/${repo}/git/blobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: file.content, encoding: "utf-8" })
      });
      blobs.push({
        path: file.path,
        mode: "100644",
        type: "blob",
        sha: blob.sha
      });
    }

    const tree = await this.request<{ sha: string }>(`/repos/${owner}/${repo}/git/trees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: blobs
      })
    });

    let commit = await this.request<{ sha: string }>(`/repos/${owner}/${repo}/git/commits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        tree: tree.sha,
        parents: [parentSha]
      })
    });

    try {
      await this.request(`/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sha: commit.sha, force: false })
      });
    } catch (patchErr: any) {
      const errText = String(patchErr?.message || patchErr);
      if (errText.includes("fast forward") || patchErr?.status === 422) {
        // Fast-forward conflict recovery: fetch latest HEAD, post a new commit with the updated parent SHA, and patch again
        const freshRef = await this.request<{ object: { sha: string } }>(
          `/repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`
        );
        const freshParentSha = freshRef.object.sha;

        commit = await this.request<{ sha: string }>(`/repos/${owner}/${repo}/git/commits`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            tree: tree.sha,
            parents: [freshParentSha]
          })
        });

        await this.request(`/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sha: commit.sha, force: true })
        });
      } else {
        throw patchErr;
      }
    }

    return commit.sha;
  }

  repositoryUrl(owner: string, repo: string, path = "") {
    return `https://github.com/${owner}/${repo}${path ? `/blob/main/${path}` : ""}`;
  }
}
