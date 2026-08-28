# Hide Amazon Deals on Slickdeals

Firefox and Chrome extension that hides Amazon-branded deal cards on Slickdeals listing pages.

## What it does

- Hides deal cards whose store name starts with **Amazon** (case-insensitive), including Amazon Warehouse, Amazon Haul, Amazon Fresh, and similar variants
- Works on listing surfaces: frontpage grid, carousels, `/deals/`, category grids, and search results
- Uses `display: none` on the card wrapper so hidden deals collapse out of the grid
- Toolbar popup with an on/off toggle (default: on)
- Shows a live count of hidden Amazon deals in the popup and on the toolbar badge

## Install (Firefox)

1. Open `about:debugging` in Firefox
2. Click **This Firefox**
3. Click **Load Temporary Add-on…**
4. Select [`manifest.json`](manifest.json) from this folder

The add-on stays loaded until Firefox restarts.

## Install (Chrome)

Chrome MV3 requires a service worker background script. This repo keeps [`manifest.json`](manifest.json) on the Firefox `background.scripts` format, so use the Chrome manifest before loading:

```bash
cp manifest.chrome.json manifest.json
```

Then:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this project folder

To switch back for Firefox:

```bash
cp manifest.firefox.json manifest.json
```

## Usage

1. Visit [slickdeals.net](https://slickdeals.net/) or any Slickdeals listing page
2. Amazon deal cards are hidden automatically
3. Click the extension icon to toggle hiding or view the hidden count

## Development

No build step. Edit the files and reload the extension in your browser.

### Files

- [`manifest.json`](manifest.json) — extension manifest (MV3)
- [`content.js`](content.js) — detects Amazon store names and hides cards
- [`content.css`](content.css) — hide rule (`.sda-hide-amazon { display: none }`)
- [`background.js`](background.js) — toolbar badge updates
- [`popup.html`](popup.html) / [`popup.js`](popup.js) — toggle and count UI

## Matching rules

- **Store name only** — deal titles mentioning Amazon from other stores are not hidden
- **Amazon-branded stores** — matches names starting with `Amazon` (regex: `/^amazon\b/i`)
- **No URL matching** — outbound links to amazon.com are not used for detection
