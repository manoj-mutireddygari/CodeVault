import { cancelQueuedUpload, drainQueue, enqueueSubmission, retryQueuedUpload, clearQueue } from "../services/syncQueue";
import { vaultStorage } from "../storage/vaultStorage";
import { GitHubClient } from "../github/GitHubClient";
import type { BackgroundMessage } from "../types";

chrome.runtime.onMessage.addListener((message: BackgroundMessage, _sender, sendResponse) => {
  // Process requests as an async block inside runtime listener
  const handleMessage = async () => {
    try {
      switch (message.type) {
        case "ACCEPTED_SUBMISSION":
          return await enqueueSubmission(message.submission);

        case "RETRY_QUEUE":
          if (message.id) {
            await retryQueuedUpload(message.id);
            return { ok: true, message: "Upload queued for retry." };
          } else {
            void drainQueue();
            return { ok: true, message: "Sync queue processing started." };
          }

        case "CANCEL_QUEUE":
          await cancelQueuedUpload(message.id);
          return { ok: true, message: "Queued upload cancelled." };

        case "CLEAR_QUEUE":
          await clearQueue();
          return { ok: true, message: "Upload queue cleared." };

        case "GET_SETTINGS":
          return await vaultStorage.getSettings();
        case "SAVE_SETTINGS":
          const savePayload = (message as any).payload;
          if (savePayload) {
            await vaultStorage.saveSettings(savePayload);
            void drainQueue();
            return { ok: true, message: "Settings saved successfully." };
          }
          return { ok: false, message: "Missing settings payload." };

        case "SYNC_STATE":
          const syncPayload = (message as any).payload;
          if (syncPayload) {
            const isUuid = (s?: string) => Boolean(s && (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s) || s.startsWith("usr_") || s.startsWith("gh_usr_")));
            
            if (syncPayload.repository) {
              if (isUuid(syncPayload.repository.owner) || isUuid(syncPayload.repository.repository_owner)) {
                syncPayload.repository.owner = syncPayload.profile?.github_username || syncPayload.profile?.username || "";
                syncPayload.repository.repository_owner = syncPayload.repository.owner;
              }
            }
            if (syncPayload.settings) {
              if (isUuid(syncPayload.settings.owner)) {
                syncPayload.settings.owner = syncPayload.profile?.github_username || syncPayload.profile?.username || "";
              }
            }

            await vaultStorage.saveSession(syncPayload.session);
            await vaultStorage.saveProfile(syncPayload.profile);
            await vaultStorage.saveRepository(syncPayload.repository);
            if (syncPayload.settings) {
              await vaultStorage.saveSettings(syncPayload.settings);
            }
            void drainQueue();
            return { ok: true, message: "Extension state synchronized." };
          }
          return { ok: false, message: "Missing sync payload." };

        case "LOGOUT":
          await vaultStorage.saveSession(null);
          await vaultStorage.saveProfile(null);
          await vaultStorage.saveRepository(null);
          return { ok: true, message: "Logged out successfully from extension." };

        case "GET_HANDSHAKE":
          const activeSession = await vaultStorage.getSession();
          const activeRepo = await vaultStorage.getRepository();
          const activeProfile = await vaultStorage.getProfile();
          const isSessionValid = activeSession && activeSession.expiresAt > Date.now();
          const isUuid = (s?: string) => Boolean(s && (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s) || s.startsWith("usr_") || s.startsWith("gh_usr_")));
          
          let repoOwner = activeRepo ? ((activeRepo as any).owner || (activeRepo as any).repository_owner || activeProfile?.github_username || activeProfile?.username) : null;
          if (isUuid(repoOwner)) {
            repoOwner = activeProfile?.github_username || activeProfile?.username || null;
          }
          
          const repoName = activeRepo ? ((activeRepo as any).repo || (activeRepo as any).repository_name) : null;
          const isRepoConfigured = activeRepo && repoOwner && repoName;
          
          return {
            status: (isSessionValid && isRepoConfigured) ? "CONNECTED" : "NOT_CONNECTED",
            userId: activeSession?.user?.id || null,
            version: "0.1.0",
            githubConnected: Boolean(activeSession?.user?.githubUsername),
            repositoryConfigured: Boolean(isRepoConfigured)
          };

        case "GET_MOCK_FILE":
          const getMockPayload = (message as any).payload;
          if (getMockPayload) {
            const { owner: mockOwner, repo: mockRepo, path: mockPath } = getMockPayload;
            const fileKey = `mock_file:${mockOwner}/${mockRepo}:${mockPath}`;
            const val = await chrome.storage.local.get(fileKey);
            return val[fileKey] || null;
          }
          return null;

        case "GET_QUEUE":
          return await vaultStorage.getQueue();

        case "GET_NOTIFICATIONS":
          return await vaultStorage.getNotifications();

        case "CLEAR_NOTIFICATIONS":
          await vaultStorage.clearNotifications();
          return { ok: true, message: "Notifications cleared." };

        case "DISMISS_NOTIFICATION":
          const dismissPayload = (message as any).payload;
          if (dismissPayload && dismissPayload.id) {
            await vaultStorage.dismissNotification(dismissPayload.id);
            return { ok: true, message: "Notification dismissed." };
          }
          return { ok: false, message: "Missing notification ID." };

        case "MARK_ALL_NOTIFICATIONS_READ":
          await vaultStorage.markAllNotificationsRead();
          return { ok: true, message: "All notifications marked as read." };

        case "VALIDATE_GITHUB":
          const valPayload = (message as any).payload;
          if (!valPayload || !valPayload.token || !valPayload.owner || !valPayload.repository) {
            return { ok: false, message: "Incomplete details for validation." };
          }
          try {
            const client = new GitHubClient(valPayload.token);
            const user = await client.validateToken();
            const repo = await client.getRepository(valPayload.owner, valPayload.repository);
            return { ok: true, user, repo };
          } catch (err: any) {
            return { ok: false, message: err.message || "Failed to validate repository connection." };
          }

        case "GET_USER_REPOS":
          const reposPayload = (message as any).payload;
          const tokenToUse = reposPayload?.token || (await vaultStorage.getSettings()).token;
          if (!tokenToUse) {
            return { ok: false, message: "No GitHub token provided." };
          }
          try {
            const client = new GitHubClient(tokenToUse);
            const repos = await client.getUserRepositories();
            return { ok: true, repos };
          } catch (err: any) {
            return { ok: false, message: err.message || "Failed to fetch repositories from GitHub." };
          }

        case "PING":
          return { ok: true, message: "pong" };

        default:
          return { ok: false, message: `Unknown action type: ${(message as any).type}` };
      }
    } catch (error: any) {
      return { ok: false, message: error.message || "Internal extension background error" };
    }
  };

  // Run the async block and send the response back to caller
  handleMessage().then(sendResponse);

  return true; // Keep message channel open for asynchronous sendResponse
});

self.addEventListener("online", () => {
  void drainQueue();
});

// Run initial queue drain on launch
void drainQueue();
