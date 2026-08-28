const enabledToggle = document.getElementById("enabled-toggle");
const countMessage = document.getElementById("count-message");
const statusMessage = document.getElementById("status-message");

function formatCount(count) {
  if (count === 1) {
    return "1 Amazon deal hidden on this page";
  }

  return `${count} Amazon deals hidden on this page`;
}

function renderCount(count, enabled) {
  if (!enabled) {
    countMessage.textContent = "Amazon deal hiding is off";
    return;
  }

  if (count === 0) {
    countMessage.textContent = "No Amazon deals hidden on this page";
    return;
  }

  countMessage.textContent = formatCount(count);
}

async function refreshCount() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    statusMessage.textContent = "No active tab found.";
    countMessage.textContent = "";
    return;
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: "getCount" });
    renderCount(response.count, response.enabled);
    statusMessage.textContent = "";
  } catch {
    countMessage.textContent = "";
    statusMessage.textContent = "Open a Slickdeals listing page to see the hidden count.";
  }
}

async function init() {
  const { enabled } = await chrome.storage.local.get({ enabled: true });
  enabledToggle.checked = enabled;
  await refreshCount();
}

enabledToggle.addEventListener("change", async () => {
  const enabled = enabledToggle.checked;
  await chrome.storage.local.set({ enabled });
  await refreshCount();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes.enabled) {
    return;
  }

  enabledToggle.checked = changes.enabled.newValue;
  refreshCount();
});

init();
