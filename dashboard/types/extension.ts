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
