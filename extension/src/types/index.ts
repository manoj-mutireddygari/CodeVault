import type { Submission } from "@codevault/shared";

export type ThemePreference = "light" | "dark" | "system";

export interface VaultSettings {
  token: string;
  owner: string;
  repository: string;
  theme: ThemePreference;
  autoSync: boolean;
  notifications: boolean;
  compactMode: boolean;
  refreshMinutes: number;
}

export interface UploadState {
  key: string;
  syncedAt: string;
  problemId: number;
}

export interface QueuedUpload {
  id: string;
  submission: Submission;
  attempts: number;
  createdAt: string;
  lastError?: string;
  status: "pending" | "failed";
}

export interface NotificationItem {
  id: string;
  category: "success" | "warning" | "error" | "info" | "sync" | "github" | "updates";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export type BackgroundMessage =
  | { type: "ACCEPTED_SUBMISSION"; submission: Submission }
  | { type: "RETRY_QUEUE"; id?: string }
  | { type: "CANCEL_QUEUE"; id: string }
  | { type: "CLEAR_QUEUE" }
  | { type: "GET_SETTINGS" }
  | { type: "SAVE_SETTINGS"; settings: VaultSettings }
  | { type: "GET_QUEUE" }
  | { type: "GET_NOTIFICATIONS" }
  | { type: "CLEAR_NOTIFICATIONS" }
  | { type: "DISMISS_NOTIFICATION"; id: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }
  | { type: "VALIDATE_GITHUB"; settings: Pick<VaultSettings, "token" | "owner" | "repository"> }
  | { type: "SYNC_STATE"; payload: any }
  | { type: "GET_HANDSHAKE" }
  | { type: "GET_MOCK_FILE"; payload: { owner: string; repo: string; path: string } }
  | { type: "LOGOUT" }
  | { type: "PING" }
  | { type: "GET_USER_REPOS"; payload?: { token?: string } };

export interface SyncResult {
  ok: boolean;
  message: string;
  url?: string;
}
