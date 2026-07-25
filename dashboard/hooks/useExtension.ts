"use client";

import { useEffect, useState, useCallback } from "react";
import { extensionBridge } from "../services/extensionBridge";
import type { VaultSettings, QueuedUpload, NotificationItem } from "../types/extension";

// Re-declare interfaces locally in case types are not fully synchronized
export interface ExtensionState {
  isInstalled: boolean;
  settings: VaultSettings | null;
  queue: QueuedUpload[];
  notifications: NotificationItem[];
  loading: boolean;
  error: string | null;
}

export function useExtension() {
  const [state, setState] = useState<ExtensionState>({
    isInstalled: false,
    settings: null,
    queue: [],
    notifications: [],
    loading: true,
    error: null
  });

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setState(prev => ({ ...prev, loading: true }));
    }

    try {
      const isInstalled = await extensionBridge.ping();
      if (!isInstalled) {
        setState({
          isInstalled: false,
          settings: null,
          queue: [],
          notifications: [],
          loading: false,
          error: "Extension not detected"
        });
        return;
      }

      const [settings, queue, notifications] = await Promise.all([
        extensionBridge.send<VaultSettings>("GET_SETTINGS"),
        extensionBridge.send<QueuedUpload[]>("GET_QUEUE"),
        extensionBridge.send<NotificationItem[]>("GET_NOTIFICATIONS")
      ]);

      setState({
        isInstalled: true,
        settings,
        queue,
        notifications,
        loading: false,
        error: null
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isInstalled: false,
        loading: false,
        error: err.message || "Failed to communicate with extension"
      }));
    }
  }, []);

  useEffect(() => {
    fetchData(true);

    // Poll the extension every 3.5s to keep dashboard state fresh
    const interval = setInterval(() => fetchData(false), 3500);

    // Listen for extension readiness event
    const handleBridgeReady = () => fetchData(false);
    window.addEventListener("message", (event) => {
      if (event.data?.source === "codevault-extension-ready") {
        fetchData(false);
      }
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener("message", handleBridgeReady);
    };
  }, [fetchData]);

  // Expose bridge actions wrapped in async handlers
  const saveSettings = async (settings: VaultSettings) => {
    const res = await extensionBridge.send<{ ok: boolean; message: string }>("SAVE_SETTINGS", settings);
    await fetchData(false);
    return res;
  };

  const validateGitHub = async (creds: Pick<VaultSettings, "token" | "owner" | "repository">) => {
    return extensionBridge.send<{ ok: boolean; user?: any; repo?: any; message?: string }>(
      "VALIDATE_GITHUB",
      creds
    );
  };

  const retryQueueItem = async (id: string) => {
    await extensionBridge.send("RETRY_QUEUE", { id });
    await fetchData(false);
  };

  const cancelQueueItem = async (id: string) => {
    await extensionBridge.send("CANCEL_QUEUE", { id });
    await fetchData(false);
  };

  const clearQueue = async () => {
    await extensionBridge.send("CLEAR_QUEUE");
    await fetchData(false);
  };

  const clearNotifications = async () => {
    await extensionBridge.send("CLEAR_NOTIFICATIONS");
    await fetchData(false);
  };

  const dismissNotification = async (id: string) => {
    await extensionBridge.send("DISMISS_NOTIFICATION", { id });
    await fetchData(false);
  };

  const markAllNotificationsRead = async () => {
    await extensionBridge.send("MARK_ALL_NOTIFICATIONS_READ");
    await fetchData(false);
  };

  return {
    ...state,
    refresh: () => fetchData(true),
    saveSettings,
    validateGitHub,
    retryQueueItem,
    cancelQueueItem,
    clearQueue,
    clearNotifications,
    dismissNotification,
    markAllNotificationsRead
  };
}
