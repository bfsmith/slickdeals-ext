const BADGE_COLOR = "#FF9900";

function isSlickdealsUrl(url) {
  if (!url) {
    return false;
  }

  try {
    const hostname = new URL(url).hostname;
    return hostname === "slickdeals.net" || hostname.endsWith(".slickdeals.net");
  } catch {
    return false;
  }
}

async function updateBadge(tabId, count, enabled) {
  if (!enabled || count <= 0) {
    await chrome.action.setBadgeText({ tabId, text: "" });
    return;
  }

  const text = count > 99 ? "99+" : String(count);
  await chrome.action.setBadgeText({ tabId, text });
  await chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLOR });
}

async function clearBadgeForTab(tabId) {
  await chrome.action.setBadgeText({ tabId, text: "" });
}

chrome.runtime.onInstalled.addListener(async () => {
  const { enabled } = await chrome.storage.local.get({ enabled: true });
  if (enabled === undefined) {
    await chrome.storage.local.set({ enabled: true });
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type !== "hiddenCount" || !sender.tab?.id) {
    return;
  }

  updateBadge(sender.tab.id, message.count, message.enabled);
});

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName !== "local" || !changes.enabled) {
    return;
  }

  const enabled = changes.enabled.newValue;
  if (enabled) {
    return;
  }

  const tabs = await chrome.tabs.query({
    url: ["https://slickdeals.net/*", "https://*.slickdeals.net/*"],
  });

  for (const tab of tabs) {
    if (tab.id !== undefined) {
      await clearBadgeForTab(tab.id);
    }
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") {
    return;
  }

  if (!isSlickdealsUrl(tab.url)) {
    await clearBadgeForTab(tabId);
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  if (!isSlickdealsUrl(tab.url)) {
    await clearBadgeForTab(tabId);
  }
});
