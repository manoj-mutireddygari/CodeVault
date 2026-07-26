import { STORAGE_KEYS, SUPABASE_URL, SUPABASE_ANON_KEY } from "../constants";
import type { QueuedUpload, UploadState, VaultSettings, NotificationItem } from "../types";
import type { AuthSession, RepositoryRecord, UserProfile } from "@codevault/types";
import type { Submission } from "@codevault/shared";
import { folderNameFor } from "@codevault/shared";

const defaults: Omit<VaultSettings, "token" | "owner" | "repository"> = {
  theme: "system",
  autoSync: true,
  notifications: true,
  compactMode: false,
  refreshMinutes: 5
};

export const vaultStorage = {
  async getRawSession(): Promise<AuthSession | null> {
    const value = await chrome.storage.local.get(STORAGE_KEYS.session);
    return (value[STORAGE_KEYS.session] as AuthSession | undefined) ?? null;
  },

  async getSession(): Promise<AuthSession | null> {
    return await this.getRawSession();
  },

  async refreshSession(): Promise<AuthSession | null> {
    const session = await this.getRawSession();
    if (!session || !session.refreshToken) {
      await this.saveSession(null);
      return null;
    }

    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        const url = `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY
          },
          body: JSON.stringify({ refresh_token: session.refreshToken })
        });

        if (res.ok) {
          const data = await res.json();
          const expiresAt = (data.expires_at || (Math.floor(Date.now() / 1000) + (data.expires_in || 3600))) * 1000;
          const updatedSession: AuthSession = {
            ...session,
            accessToken: data.access_token || session.accessToken,
            refreshToken: data.refresh_token || session.refreshToken,
            expiresAt
          };
          await this.saveSession(updatedSession);
          return updatedSession;
        } else if (res.status === 400 || res.status === 401) {
          await this.saveSession(null);
          return null;
        }
      } catch (e) {
        console.warn("Extension refresh token fetch error (offline):", e);
      }
    }

    if (session.refreshToken.startsWith("sb_") || session.refreshToken.startsWith("sb_gh_")) {
      const updatedSession: AuthSession = {
        ...session,
        expiresAt: Date.now() + 7 * 24 * 3600 * 1000
      };
      await this.saveSession(updatedSession);
      return updatedSession;
    }

    return session;
  },

  async ensureValidSession(): Promise<AuthSession | null> {
    const session = await this.getRawSession();
    if (!session) return null;

    if (session.expiresAt && session.expiresAt > Date.now() + 60000) {
      return session;
    }

    return await this.refreshSession();
  },

  async saveSession(session: AuthSession | null) {
    if (!session) {
      await chrome.storage.local.remove(STORAGE_KEYS.session);
    } else {
      await chrome.storage.local.set({ [STORAGE_KEYS.session]: session });
    }
  },

  async getProfile(): Promise<UserProfile | null> {
    const value = await chrome.storage.local.get(STORAGE_KEYS.profile);
    return (value[STORAGE_KEYS.profile] as UserProfile | undefined) ?? null;
  },

  async saveProfile(profile: UserProfile | null) {
    if (!profile) {
      await chrome.storage.local.remove(STORAGE_KEYS.profile);
    } else {
      await chrome.storage.local.set({ [STORAGE_KEYS.profile]: profile });
    }
  },

  async getRepository(): Promise<RepositoryRecord | null> {
    const value = await chrome.storage.local.get(STORAGE_KEYS.repository);
    return (value[STORAGE_KEYS.repository] as RepositoryRecord | undefined) ?? null;
  },

  async saveRepository(repo: RepositoryRecord | null) {
    if (!repo) {
      await chrome.storage.local.remove(STORAGE_KEYS.repository);
    } else {
      await chrome.storage.local.set({ [STORAGE_KEYS.repository]: repo });
    }
  },

  async getSettings(): Promise<VaultSettings> {
    const value = (await chrome.storage.local.get(STORAGE_KEYS.settings))[STORAGE_KEYS.settings] as Partial<VaultSettings> | undefined;
    const session = await this.getSession();
    const repo = await this.getRepository() as any;
    const profile = await this.getProfile();

    const isUuidOrUserId = (str?: string) =>
      Boolean(
        !str ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) ||
        str.startsWith("usr_") ||
        str.startsWith("gh_usr_")
      );

    let rawOwner = repo?.repository_owner || repo?.owner || value?.owner || profile?.github_username || profile?.username || session?.user?.githubUsername || "";
    if (isUuidOrUserId(rawOwner)) {
      rawOwner = profile?.github_username || profile?.username || session?.user?.githubUsername || "";
      if (isUuidOrUserId(rawOwner)) {
        rawOwner = "";
      }
    }

    // Resolve token: Prefer dedicated GitHub PAT (from repository record or saved settings) over Supabase access token
    let resolvedToken = repo?.github_token || value?.token || "";
    if (!resolvedToken && session?.accessToken && !session.accessToken.startsWith("sb_")) {
      resolvedToken = session.accessToken;
    }

    return {
      ...defaults,
      ...value,
      token: resolvedToken || value?.token || "",
      repository: repo?.repo || repo?.repository_name || value?.repository || "leetcode",
      owner: rawOwner, // Ensure non-UUID sanitized owner overrides any stale saved setting!
    };
  },

  async saveSettings(settings: VaultSettings) {
    await chrome.storage.local.set({ [STORAGE_KEYS.settings]: settings });
  },

  async getLastUpload(): Promise<UploadState | undefined> {
    return (await chrome.storage.local.get(STORAGE_KEYS.lastUpload))[STORAGE_KEYS.lastUpload] as UploadState | undefined;
  },

  async saveLastUpload(upload: UploadState) {
    await chrome.storage.local.set({ [STORAGE_KEYS.lastUpload]: upload });
  },

  async getQueue(): Promise<QueuedUpload[]> {
    return ((await chrome.storage.local.get(STORAGE_KEYS.syncQueue))[STORAGE_KEYS.syncQueue] as QueuedUpload[] | undefined) ?? [];
  },

  async saveQueue(queue: QueuedUpload[]) {
    await chrome.storage.local.set({ [STORAGE_KEYS.syncQueue]: queue });
  },

  async getNotifications(): Promise<NotificationItem[]> {
    return ((await chrome.storage.local.get(STORAGE_KEYS.notifications))[STORAGE_KEYS.notifications] as NotificationItem[] | undefined) ?? [];
  },

  async syncLogToSupabase(item: NotificationItem) {
    try {
      const session = await this.getSession();
      if (!session || !session.user?.id) return;

      const url = `${SUPABASE_URL}/rest/v1/sync_logs`;
      const token = session.accessToken && !session.accessToken.startsWith("sb_") ? session.accessToken : SUPABASE_ANON_KEY;

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${token}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          user_id: session.user.id,
          category: item.category || "system",
          title: item.title,
          message: item.message,
          created_at: item.timestamp || new Date().toISOString()
        })
      });
    } catch {
      // Ignore background sync error (e.g. offline)
    }
  },

  async syncQueueToSupabase(item: QueuedUpload) {
    try {
      const session = await this.getSession();
      if (!session || !session.user?.id) return;

      const token = session.accessToken && !session.accessToken.startsWith("sb_") ? session.accessToken : SUPABASE_ANON_KEY;
      const headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${token}`
      };

      // 1. Try PATCH update if item.id exists on Supabase queue
      if (item.id) {
        const patchUrl = `${SUPABASE_URL}/rest/v1/sync_queue?id=eq.${item.id}`;
        const patchRes = await fetch(patchUrl, {
          method: "PATCH",
          headers: { ...headers, "Prefer": "return=representation" },
          body: JSON.stringify({
            status: item.status || "pending",
            attempts: item.attempts || 0,
            error_message: item.lastError || null,
            synced_at: (item.status as string) === "done" ? new Date().toISOString() : null
          })
        });

        if (patchRes.ok) {
          const updated = await patchRes.json().catch(() => []);
          if (Array.isArray(updated) && updated.length > 0) {
            return; // Successfully updated existing row by ID!
          }
        }
      }

      // 2. If row doesn't exist yet, POST to insert item with primary key id
      const postUrl = `${SUPABASE_URL}/rest/v1/sync_queue`;
      await fetch(postUrl, {
        method: "POST",
        headers: { ...headers, "Prefer": "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          id: item.id,
          user_id: session.user.id,
          problem_id: item.submission.problemId,
          title: item.submission.title,
          slug: item.submission.slug,
          difficulty: item.submission.difficulty || "Unknown",
          topics: item.submission.topics || [],
          language: item.submission.language,
          source_code: item.submission.sourceCode,
          runtime: item.submission.runtime || null,
          memory: item.submission.memory || null,
          submitted_at: item.submission.submittedAt || new Date().toISOString(),
          leetcode_url: item.submission.leetCodeUrl || null,
          status: item.status || "pending",
          attempts: item.attempts || 0,
          error_message: item.lastError || null,
          synced_at: (item.status as string) === "done" ? new Date().toISOString() : null
        })
      });
    } catch (e) {
      console.warn("Failed to sync queue item to Supabase:", e);
    }
  },

  async syncSubmissionToSupabase(submission: Submission, githubUrl?: string) {
    try {
      const session = await this.getSession();
      if (!session || !session.user?.id) return;

      const url = `${SUPABASE_URL}/rest/v1/submissions?on_conflict=user_id,problem_id,language`;
      const token = session.accessToken && !session.accessToken.startsWith("sb_") ? session.accessToken : SUPABASE_ANON_KEY;
      const folderName = folderNameFor(submission.problemId, submission.slug);

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${token}`,
          "Prefer": "resolution=merge-duplicates,return=minimal"
        },
        body: JSON.stringify({
          user_id: session.user.id,
          problem_id: submission.problemId,
          title: submission.title,
          slug: submission.slug,
          difficulty: submission.difficulty || "Unknown",
          topics: submission.topics || [],
          language: submission.language,
          source_code: submission.sourceCode,
          runtime: submission.runtime || null,
          memory: submission.memory || null,
          submitted_at: submission.submittedAt || new Date().toISOString(),
          github_url: githubUrl || null,
          folder_name: folderName
        })
      });
    } catch (e) {
      console.warn("Failed to sync submission to Supabase:", e);
    }
  },

  async saveNotification(item: NotificationItem) {
    const list = await this.getNotifications();
    list.unshift(item); // Add to beginning
    // Cap history at 50 notifications to prevent memory footprint inflation
    if (list.length > 50) {
      list.length = 50;
    }
    await chrome.storage.local.set({ [STORAGE_KEYS.notifications]: list });
    void this.syncLogToSupabase(item);
  },

  async clearNotifications() {
    await chrome.storage.local.set({ [STORAGE_KEYS.notifications]: [] });
  },

  async dismissNotification(id: string) {
    const list = await this.getNotifications();
    const filtered = list.filter(item => item.id !== id);
    await chrome.storage.local.set({ [STORAGE_KEYS.notifications]: filtered });
  },

  async markAllNotificationsRead() {
    const list = await this.getNotifications();
    const updated = list.map(item => ({ ...item, read: true }));
    await chrome.storage.local.set({ [STORAGE_KEYS.notifications]: updated });
  }
};
