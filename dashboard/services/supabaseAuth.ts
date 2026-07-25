import type { AuthSession, RepositoryRecord, UserProfile, UserSettings } from "@codevault/types";
import { createClient } from "@supabase/supabase-js";
import { extensionBridge } from "./extensionBridge";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isRealSupabase = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("mock-supabase")
);

export const supabase = isRealSupabase
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  : null;

const AUTH_KEY = "codevault_supabase_session";
const PROFILE_KEY = "codevault_supabase_profile";
const REPO_KEY = "codevault_supabase_repository";
const SETTINGS_KEY = "codevault_supabase_settings";

export async function syncStateToExtension() {
  if (typeof window === "undefined") return;
  try {
    const isInstalled = await extensionBridge.ping();
    if (!isInstalled) return;

    const sessionStr = localStorage.getItem(AUTH_KEY);
    const profileStr = localStorage.getItem(PROFILE_KEY);
    const repoStr = localStorage.getItem(REPO_KEY);
    const settingsStr = localStorage.getItem(SETTINGS_KEY);

    const session = sessionStr ? JSON.parse(sessionStr) : null;
    const profile = profileStr ? JSON.parse(profileStr) : null;
    const repository = repoStr ? JSON.parse(repoStr) : null;
    const settings = settingsStr ? JSON.parse(settingsStr) : null;

    let mappedRepo = null;
    const githubToken = localStorage.getItem("codevault:github_token") || repository?.github_token || "";
    if (repository) {
      mappedRepo = {
        owner: repository.repository_owner || repository.owner || profile?.github_username || profile?.username || "",
        repo: repository.repository_name || repository.repo || "",
        default_branch: repository.default_branch || "main",
        visibility: repository.visibility || "public",
        github_token: githubToken
      };
    } else {
      const legacyRepoStr = localStorage.getItem("codevault:repository");
      if (legacyRepoStr) {
        const legacyRepo = JSON.parse(legacyRepoStr);
        mappedRepo = {
          owner: legacyRepo.owner,
          repo: legacyRepo.repo,
          default_branch: "main",
          visibility: "public",
          github_token: githubToken
        };
      }
    }

    await extensionBridge.send("SYNC_STATE", {
      session,
      profile,
      repository: mappedRepo,
      settings
    });
  } catch (e) {
    console.warn("Failed to sync state to extension:", e);
  }
}

const generateUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ (typeof crypto !== "undefined" ? crypto.getRandomValues(new Uint8Array(1))[0] : Math.random() * 16) & 15 >> +c / 4).toString(16)
  );
};

export const supabaseAuth = {
  // Get active session
  getSession(): AuthSession | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (!stored) return null;
      const session = JSON.parse(stored) as AuthSession;
      if (session.expiresAt && session.expiresAt < Date.now()) {
        localStorage.removeItem(AUTH_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  // Save session
  setSession(session: AuthSession | null) {
    if (typeof window === "undefined") return;
    if (!session) {
      localStorage.removeItem(AUTH_KEY);
    } else {
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    }
    syncStateToExtension();
  },

  // Email + Password Sign Up (Requires Email Verification, No Auto-Login)
  async signUp(email: string, password: string, fullName: string): Promise<{ success: boolean; needsVerification?: boolean; error?: string }> {
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        if (error) return { success: false, error: error.message };

        // Do NOT create or save active session here.
        // The user MUST verify their email first, then proceed to sign in.
        return { success: true, needsVerification: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Supabase Sign-Up Error" };
      }
    }

    // Local Storage Mock Fallback (Registration success without auto-login)
    return { success: true, needsVerification: true };
  },

  // Email + Password Sign In
  async signIn(email: string, password: string): Promise<{ session: AuthSession | null; error?: string }> {
    if (!email || !password) {
      return { session: null, error: "Email and password are required." };
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { session: null, error: error.message };

        const userId = data.user?.id || "";

        // Retrieve custom user profile
        let { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
        if (!profile) {
          profile = {
            id: userId,
            email,
            full_name: email.split("@")[0],
            username: email.split("@")[0],
            plan: "free",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await supabase.from("profiles").upsert(profile);
        }

        const sessionPayload: AuthSession = {
          accessToken: data.session?.access_token || "sb_at_dummy",
          refreshToken: data.session?.refresh_token || "sb_rt_dummy",
          expiresAt: (data.session?.expires_at || 0) * 1000 || (Date.now() + 7 * 24 * 3600 * 1000),
          user: {
            id: userId,
            email,
            fullName: profile.full_name || email.split("@")[0]
          }
        };

        this.setSession(sessionPayload);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

        // Fetch repository mapping if it exists in Supabase
        const { data: repoData } = await supabase
          .from("repositories")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (repoData) {
          localStorage.setItem(REPO_KEY, JSON.stringify(repoData));
          localStorage.setItem("codevault:repository", JSON.stringify({ owner: repoData.repository_owner || repoData.user_id, repo: repoData.repository_name }));
          if (repoData.github_token) {
            localStorage.setItem("codevault:github_token", repoData.github_token);
          }
          localStorage.setItem("codevault:onboarding_completed", "true");
        }

        return { session: sessionPayload };
      } catch (err: any) {
        return { session: null, error: err.message || "Supabase Sign-In Error" };
      }
    }

    // Local Storage Mock Fallback
    const userId = "usr_" + Math.random().toString(36).substring(2, 11);
    const session: AuthSession = {
      accessToken: "sb_at_" + Math.random().toString(36).substring(2, 15),
      refreshToken: "sb_rt_" + Math.random().toString(36).substring(2, 15),
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
      user: {
        id: userId,
        email,
        fullName: email.split("@")[0],
      },
    };

    const profile: UserProfile = {
      id: userId,
      email,
      full_name: email.split("@")[0],
      username: email.split("@")[0],
      plan: "free",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.setSession(session);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

    return { session };
  },

  // Magic Link Sign In
  async signInWithMagicLink(email: string): Promise<{ ok: boolean; message: string }> {
    if (!email.includes("@")) {
      return { ok: false, message: "Please provide a valid email address." };
    }
    if (supabase) {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) return { ok: false, message: error.message };
    }
    return { ok: true, message: `Magic authentication link dispatched to ${email}.` };
  },

  // GitHub OAuth Sign In
  async signInWithGitHub(): Promise<{ session: AuthSession }> {
    if (supabase) {
      // Trigger OAuth redirects if in production environment, here we connect simulated session
    }

    const userId = "gh_usr_" + Math.random().toString(36).substring(2, 10);
    const session: AuthSession = {
      accessToken: "sb_gh_at_" + Math.random().toString(36).substring(2, 15),
      refreshToken: "sb_gh_rt_" + Math.random().toString(36).substring(2, 15),
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
      user: {
        id: userId,
        email: "developer@github.com",
        fullName: "GitHub Developer",
        githubUsername: "octocat",
      },
      repository: {
        owner: "octocat",
        name: "leetcode-vault",
        visibility: "public",
      },
    };

    const profile: UserProfile = {
      id: userId,
      email: "developer@github.com",
      full_name: "GitHub Developer",
      username: "octocat",
      github_username: "octocat",
      plan: "pro",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const repo: RepositoryRecord = {
      id: "repo_" + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      repository_name: "leetcode-vault",
      visibility: "public",
      default_branch: "main",
      created_at: new Date().toISOString(),
    };

    this.setSession(session);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(REPO_KEY, JSON.stringify(repo));
    localStorage.setItem("codevault:repository", JSON.stringify({ owner: "octocat", repo: "leetcode-vault" }));

    return { session };
  },

  // Reset Password
  async resetPassword(email: string): Promise<{ ok: boolean; message: string }> {
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { ok: false, message: error.message };
    }
    return { ok: true, message: `Password reset instructions sent to ${email}.` };
  },

  // Sign Out
  async signOut(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(REPO_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem("codevault_supabase_logs");
      localStorage.removeItem("codevault:repository");
      localStorage.removeItem("codevault:github_token");
      localStorage.removeItem("codevault:onboarding_completed");
    }
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Supabase signOut warning:", e);
      }
    }
    await syncStateToExtension();
  },

  // Profile Management
  getProfile(): UserProfile | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(PROFILE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as UserProfile;
    } catch {
      return null;
    }
  },

  async fetchProfileFromSupabase(): Promise<UserProfile | null> {
    if (supabase) {
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (profile) {
          localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
          return profile;
        }
      }
    }
    return this.getProfile();
  },

  saveProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getProfile() || {
      id: "usr_default",
      email: "user@codevault.dev",
      full_name: "CodeVault User",
      username: "user",
      plan: "free",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = { ...current, ...profile, updated_at: new Date().toISOString() };
    if (typeof window !== "undefined") {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    }

    if (supabase && current.id && current.id !== "usr_default") {
      supabase
        .from("profiles")
        .upsert(updated, { onConflict: "id" })
        .then(({ error }) => {
          if (error) {
            console.warn("Failed to sync profile to Supabase:", error.message || error);
          } else {
            console.log("Profile saved to Supabase successfully:", updated.email || updated.id);
          }
          syncStateToExtension();
        });
    } else {
      syncStateToExtension();
    }

    return updated;
  },

  // Repository Table Management
  getRepository(): RepositoryRecord | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(REPO_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as RepositoryRecord;
    } catch {
      return null;
    }
  },

  saveRepository(repo: Partial<RepositoryRecord>): RepositoryRecord {
    const session = this.getSession();
    const current = this.getRepository() || {
      id: generateUUID(),
      user_id: session?.user?.id || "usr_default",
      repository_name: "leetcode",
      repository_owner: "",
      visibility: "public",
      default_branch: "main",
      created_at: new Date().toISOString(),
    };

    const updated = {
      ...current,
      ...repo,
      user_id: session?.user?.id || current.user_id
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(REPO_KEY, JSON.stringify(updated));
      localStorage.setItem(
        "codevault:repository",
        JSON.stringify({ owner: updated.repository_owner || "", repo: updated.repository_name })
      );
      if (updated.github_token) {
        localStorage.setItem("codevault:github_token", updated.github_token);
      }
    }

    if (supabase && updated.user_id && updated.user_id !== "usr_default") {
      // Strip the local-generated id so Supabase auto-manages it.
      // Use onConflict: "user_id" so this correctly updates an existing row.
      const { id: _id, ...upsertPayload } = updated as any;
      supabase
        .from("repositories")
        .upsert(upsertPayload, { onConflict: "user_id" })
        .then(({ error }) => {
          if (error) {
            console.error("Failed to sync repository to Supabase:", error.message, error.details);
          } else {
            console.log("Repository saved to Supabase successfully:", upsertPayload.repository_name);
          }
          syncStateToExtension();
        });
    } else {
      syncStateToExtension();
    }

    return updated;
  },

  // Settings Table Management
  getSettings(): UserSettings {
    const defaults: UserSettings = {
      user_id: "usr_default",
      theme: "system",
      animations: true,
      compact_mode: false,
      notifications: true,
      default_page: "/",
      refresh_interval: 5,
      updated_at: new Date().toISOString(),
    };

    if (typeof window === "undefined") return defaults;
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return defaults;
    try {
      return { ...defaults, ...JSON.parse(stored) };
    } catch {
      return defaults;
    }
  },

  saveSettings(settings: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
    if (typeof window !== "undefined") {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    }

    if (supabase && current.user_id !== "usr_default") {
      supabase.from("settings").upsert(updated).then(({ error }) => {
        if (error) console.error("Failed to sync settings to Supabase:", error);
        syncStateToExtension();
      });
    } else {
      syncStateToExtension();
    }

    return updated;
  },

  // Sync Logs / Audit Logs Management
  async getSyncLogs(): Promise<Array<{ id: string; category: string; title: string; message: string; timestamp: string }>> {
    const session = this.getSession();
    if (supabase && session?.user?.id) {
      const { data, error } = await supabase
        .from("sync_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        return data.map((item: any) => ({
          id: item.id,
          category: item.category || "system",
          title: item.title,
          message: item.message,
          timestamp: item.created_at
        }));
      }
    }

    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("codevault_supabase_logs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  async saveSyncLog(log: { category?: string; title: string; message: string }): Promise<void> {
    const session = this.getSession();
    const logItem = {
      id: generateUUID(),
      category: log.category || "system",
      title: log.title,
      message: log.message,
      timestamp: new Date().toISOString()
    };

    if (typeof window !== "undefined") {
      const existing = await this.getSyncLogs();
      existing.unshift(logItem);
      if (existing.length > 50) existing.length = 50;
      localStorage.setItem("codevault_supabase_logs", JSON.stringify(existing));
    }

    if (supabase && session?.user?.id) {
      await supabase.from("sync_logs").insert({
        user_id: session.user.id,
        category: log.category || "system",
        title: log.title,
        message: log.message,
        created_at: logItem.timestamp
      });
    }
  },

  async clearSyncLogs(): Promise<void> {
    const session = this.getSession();
    if (typeof window !== "undefined") {
      localStorage.removeItem("codevault_supabase_logs");
    }
    if (supabase && session?.user?.id) {
      await supabase.from("sync_logs").delete().eq("user_id", session.user.id);
    }
  }
};
