import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the global chrome APIs
const mockStorage: Record<string, any> = {};
global.chrome = {
  storage: {
    local: {
      get: vi.fn().mockImplementation(async (keys) => {
        const res: Record<string, any> = {};
        if (typeof keys === "string") {
          res[keys] = mockStorage[keys];
        } else if (Array.isArray(keys)) {
          for (const k of keys) {
            res[k] = mockStorage[k];
          }
        } else if (typeof keys === "object") {
          for (const k of Object.keys(keys)) {
            res[k] = mockStorage[k] ?? keys[k];
          }
        }
        return res;
      }),
      set: vi.fn().mockImplementation(async (items) => {
        Object.assign(mockStorage, items);
      })
    }
  },
  notifications: {
    create: vi.fn().mockResolvedValue("mock-notif-id")
  }
} as any;

if (typeof global.navigator === "undefined") {
  (global as any).navigator = {};
}
Object.defineProperty(global.navigator, "onLine", {
  get: () => true,
  configurable: true
});

// Mock the navigator.onLine status
const onlineSpy = vi.spyOn(navigator, "onLine", "get");

// Mock syncSubmission service to avoid real network fetches
vi.mock("../extension/src/services/syncService", () => ({
  syncSubmission: vi.fn().mockImplementation(async (sub) => {
    if (sub.problemId === 999) {
      throw new Error("Simulated sync error");
    }
    return { ok: true, message: "Upload Successful", url: "https://github.com/mock" };
  })
}));

import { enqueueSubmission, cancelQueuedUpload, retryQueuedUpload } from "../extension/src/services/syncQueue";
import { vaultStorage } from "../extension/src/storage/vaultStorage";
import type { Submission } from "@codevault/shared";

describe("syncQueue", () => {
  beforeEach(() => {
    // Clear mock storage
    for (const key of Object.keys(mockStorage)) {
      delete mockStorage[key];
    }
    vi.clearAllMocks();
  });

  const dummySubmission: Submission = {
    problemId: 1,
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    topics: ["Array"],
    language: "python",
    sourceCode: "print('hello')",
    leetCodeUrl: "https://leetcode.com/problems/two-sum/",
    submittedAt: new Date().toISOString()
  };

  it("should successfully enqueue a submission", async () => {
    onlineSpy.mockReturnValue(false); // mock offline so it doesn't drain instantly
    
    const result = await enqueueSubmission(dummySubmission);
    expect(result.ok).toBe(true);
    expect(result.message).toContain("Saved offline");

    const queue = await vaultStorage.getQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].submission.title).toBe("Two Sum");
    expect(queue[0].status).toBe("pending");
  });

  it("should reject duplicate enqueues", async () => {
    onlineSpy.mockReturnValue(false);

    await enqueueSubmission(dummySubmission);
    const dupResult = await enqueueSubmission(dummySubmission);
    
    expect(dupResult.ok).toBe(false);
    expect(dupResult.message).toBe("Duplicate Submission Ignored");

    const queue = await vaultStorage.getQueue();
    expect(queue.length).toBe(1);
  });

  it("should allow cancelling queued uploads", async () => {
    onlineSpy.mockReturnValue(false);

    await enqueueSubmission(dummySubmission);
    let queue = await vaultStorage.getQueue();
    const id = queue[0].id;

    await cancelQueuedUpload(id);
    
    queue = await vaultStorage.getQueue();
    expect(queue.length).toBe(0);
  });

  it("should log errors and increment attempts when uploads fail", async () => {
    onlineSpy.mockReturnValue(true); // online so it attempts sync

    const failingSubmission = { ...dummySubmission, problemId: 999 };
    await enqueueSubmission(failingSubmission);

    // Wait for async background drain task to finish
    await new Promise(resolve => setTimeout(resolve, 100));

    const queue = await vaultStorage.getQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].attempts).toBe(1);
    expect(queue[0].status).toBe("failed");
    expect(queue[0].lastError).toBe("Simulated sync error");
  });
});
