import { vaultStorage } from "../storage/vaultStorage";

export async function notify(title: string, message: string) {
  try {
    if (!(await vaultStorage.getSettings()).notifications) return;
    if (typeof chrome !== "undefined" && chrome.notifications) {
      await chrome.notifications.create({
        type: "basic",
        iconUrl: "icon-128.png",
        title,
        message
      });
    }
  } catch (err) {
    console.warn("[CodeVault] Notification display skipped:", err);
  }
}
