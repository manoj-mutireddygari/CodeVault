import type { Submission } from "@codevault/shared";
import { notify } from "../events/notifications";
import { vaultStorage } from "../storage/vaultStorage";
import type { QueuedUpload, SyncResult } from "../types";
import { logger } from "../utils/logger";
import { syncSubmission } from "./syncService";

const keyFor = (submission: Submission) =>
  `${submission.problemId}:${submission.language}:${submission.sourceCode}`;

let draining = false;

// Sequential queue helper: ensures background operations are serialized
const queueMutex = {
  active: false,
  queue: [] as (() => Promise<void>)[],
  async run(task: () => Promise<void>) {
    if (this.active) {
      return new Promise<void>((resolve) => {
        this.queue.push(async () => {
          await task();
          resolve();
        });
      });
    }
    this.active = true;
    try {
      await task();
    } finally {
      this.active = false;
      const next = this.queue.shift();
      if (next) void this.run(next);
    }
  }
};

export async function enqueueSubmission(submission: Submission): Promise<SyncResult> {
  const queue = await vaultStorage.getQueue();
  const key = keyFor(submission);
  let queuedItem: QueuedUpload;

  const existingIndex = queue.findIndex(item => keyFor(item.submission) === key);
  if (existingIndex !== -1) {
    return { ok: false, message: "Duplicate Submission Ignored" };
  } else {
    queuedItem = {
      id: crypto.randomUUID(),
      submission,
      attempts: 0,
      createdAt: new Date().toISOString(),
      status: "pending"
    };
    queue.push(queuedItem);
  }

  await vaultStorage.saveQueue(queue);
  void vaultStorage.syncQueueToSupabase(queuedItem);
  void triggerDrain();

  return {
    ok: true,
    message: navigator.onLine ? "Queued for upload" : "Saved offline. It will sync when you reconnect."
  };
}

export async function cancelQueuedUpload(id: string): Promise<void> {
  const queue = await vaultStorage.getQueue();
  const filtered = queue.filter(item => item.id !== id);
  await vaultStorage.saveQueue(filtered);
  logger.debug("queue:cancelled", { id });
}

export async function retryQueuedUpload(id: string): Promise<void> {
  let queue = await vaultStorage.getQueue();
  let retriedItem: QueuedUpload | undefined;
  queue = queue.map(item => {
    if (item.id === id) {
      retriedItem = { ...item, status: "pending" as const, attempts: 0, lastError: undefined };
      return retriedItem;
    }
    return item;
  });
  await vaultStorage.saveQueue(queue);
  if (retriedItem) {
    void vaultStorage.syncQueueToSupabase(retriedItem);
  }
  void triggerDrain(id);
}

export async function clearQueue(): Promise<void> {
  await vaultStorage.saveQueue([]);
  logger.debug("queue:cleared");
}

function triggerDrain(onlyId?: string) {
  void queueMutex.run(() => drainQueueInternal(onlyId));
}

async function drainQueueInternal(onlyId?: string) {
  if (draining) return;
  if (!navigator.onLine) {
    logger.debug("sync:offline-drain-aborted");
    return;
  }

  draining = true;
  try {
    let queue = await vaultStorage.getQueue();
    // Filter queue to items that can be processed
    const eligible = queue.filter((entry) => {
      if (onlyId) return entry.id === onlyId;
      // Auto-drain: only pending or failed items with less than 5 attempts
      return entry.status === "pending" || (entry.status === "failed" && entry.attempts < 5);
    });

    for (const item of eligible) {
      try {
        logger.debug("sync:start", { id: item.id, problem: item.submission.title });
        
        const result = await syncSubmission(item.submission);
        
        if (!result.ok && result.message !== "Duplicate Submission Ignored") {
          throw new Error(result.message);
        }

        // Remove successfully synced item from local queue
        queue = queue.filter(entry => entry.id !== item.id);
        await vaultStorage.saveQueue(queue);
        
        // Sync completed submission and completed queue item to Supabase
        void vaultStorage.syncSubmissionToSupabase(item.submission, result.url);
        void vaultStorage.syncQueueToSupabase({ ...item, status: "done" as any });

        logger.debug("sync:success", { id: item.id });
        await vaultStorage.saveNotification({
          id: crypto.randomUUID(),
          category: "sync",
          title: "Submission Synced Successfully",
          message: `Saved #${item.submission.problemId} ${item.submission.title} to GitHub.`,
          timestamp: new Date().toISOString(),
          read: false
        });
        notify("CodeVault", result.message);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed";
        const failedItem: QueuedUpload = { ...item, attempts: item.attempts + 1, status: "failed", lastError: message };
        
        queue = queue.map(entry =>
          entry.id === item.id ? failedItem : entry
        );
        await vaultStorage.saveQueue(queue);
        void vaultStorage.syncQueueToSupabase(failedItem);
        
        logger.warn("sync:failed", { id: item.id, message });

        // Avoid spamming identical unread error notifications
        const notifications = await vaultStorage.getNotifications();
        const hasDuplicateError = notifications.some(
          n => !n.read && n.category === "error" && n.message.includes(`#${item.submission.problemId} `)
        );
        if (!hasDuplicateError) {
          await vaultStorage.saveNotification({
            id: crypto.randomUUID(),
            category: "error",
            title: "Sync Failed",
            message: `Failed to upload #${item.submission.problemId} ${item.submission.title}: ${message}`,
            timestamp: new Date().toISOString(),
            read: false
          });
        }
        notify("CodeVault", `Upload failed: ${message}`);
      }
    }
  } finally {
    draining = false;
  }
}

export async function drainQueue(onlyId?: string) {
  triggerDrain(onlyId);
}
