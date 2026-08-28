const HIDE_CLASS = "sda-hide-amazon";
const AMAZON_STORE_REGEX = /^amazon\b/i;

const CARD_SELECTORS = [
  "li.frontpageGrid__feedItem",
  "div.frontpageRecommendationCarousel__feedItem",
  "li.carousel__slide",
  "li.categoryPageDealGrid__feedItem",
  "li.bp-p-dealCard",
  "div.resultRow",
  "div.dealCardListView",
].join(", ");

const STORE_SELECTORS = [
  ".dealCard__storeLink",
  ".dealCardListView__store",
  ".bp-p-dealCard_storeLink",
  ".itemStore",
];

let enabled = true;
let hiddenCount = 0;
let scanScheduled = false;

function getStoreName(card) {
  for (const selector of STORE_SELECTORS) {
    const storeEl = card.querySelector(selector);
    if (!storeEl) {
      continue;
    }

    const contentAttr = storeEl.getAttribute("content");
    const name = (contentAttr || storeEl.textContent || "").trim();
    if (name) {
      return name;
    }
  }

  return null;
}

function isAmazonStore(storeName) {
  return Boolean(storeName && AMAZON_STORE_REGEX.test(storeName));
}

function applyFilter() {
  hiddenCount = 0;

  for (const card of document.querySelectorAll(CARD_SELECTORS)) {
    const storeName = getStoreName(card);
    const shouldHide = enabled && isAmazonStore(storeName);

    card.classList.toggle(HIDE_CLASS, shouldHide);
    if (shouldHide) {
      hiddenCount += 1;
    }
  }

  chrome.runtime.sendMessage({
    type: "hiddenCount",
    count: hiddenCount,
    enabled,
  });
}

function scheduleScan() {
  if (scanScheduled) {
    return;
  }

  scanScheduled = true;
  requestAnimationFrame(() => {
    scanScheduled = false;
    applyFilter();
  });
}

function startObserver() {
  const observer = new MutationObserver(() => {
    scheduleScan();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

chrome.storage.local.get({ enabled: true }, ({ enabled: storedEnabled }) => {
  enabled = storedEnabled;
  applyFilter();
  startObserver();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes.enabled) {
    return;
  }

  enabled = changes.enabled.newValue;
  applyFilter();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "getCount") {
    sendResponse({ count: hiddenCount, enabled });
    return true;
  }

  return false;
});
