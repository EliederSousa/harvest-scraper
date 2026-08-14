# Harvest Scraper

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Firefox](https://img.shields.io/badge/Firefox-FF7139?logo=firefoxbrowser&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

*When your automated web scraping fails, use this.*

A Firefox extension for extracting (scraping) data from web pages using configurable rules, no code required. It runs as a sidebar, so you can browse the site normally while capturing data.

## Features

- **Chained rules per field**: each field can combine multiple steps (CSS Selector → Attribute → Regex, etc.) to refine extraction.
- **9 rule types**: CSS Selector, Attribute, Index, Range, Text Content, Regex, Page Title, Actual Link and Auto Link.
- **Live preview**: results update automatically as you type rules — no need to press anything to test a single page.
- **Sections (tabs)**: split rules into multiple contexts — e.g. one tab to capture links from a listing page and another to extract data from each detail page.
  - A tab can be a *link source*: for each link found by one of its fields, the extension visits the page, runs another tab's rules and saves a combined row.
  - *Static links*: capture links once and reuse them without re-harvesting the listing.
- **Auto Harvest**: automatically navigates through pages following the `Auto Link` rule, collecting data on each one until no next page is found (or the safety page limit is reached).
- **Incremental accumulation**: captured data is progressively saved to the extension's `storage.local`, so you can pause and resume without losing progress.
- **CSV / JSON export**: download all accumulated data as CSV (Excel/Sheets ready) or JSON (optionally keyed by a primary field).
- **Save/Load rules as JSON**: export the configured rule set and re-import it later (or share it across machines/sites).

## Installation

Go to https://addons.mozilla.org/pt-BR/firefox/addon/harvest-scraper/ and download the official version.


## Instalation (developer mode)

1. Clone the repository.
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on** and select the project's `manifest.json` file.
4. Click the extension icon in the toolbar to open the sidebar.

## Quick start

1. Navigate to the page you want to capture.
2. Add a field (**Add row**), give it a name and define its extraction rule(s).
3. The results area under each field updates live as you type — check that the values look right.
4. Click **Harvest** to store the current page's results into the accumulated data.
5. Use **CSV** / **JSON** to download everything collected so far.

## Rule types

Each field is a **chain of steps**. The first step always starts from the whole page (`document.body`); every following step works on the output of the previous one. Click the **+** button to append a step and the trash button to remove one (the first step can't be removed).

Rules that extract an attribute/regex (e.g. `Attribute`, `Regex`) take their input from the **rule text box**; rules that don't need input (`TextContent`, `PageTitle`, `ActualLink`) ignore it.

| Rule | Rule box input | What it does |
|------|----------------|--------------|
| **CSS Selector** | A CSS selector | Selects all matching elements (e.g. `a[data-primary=true]`, `div.result`). Keeps the live DOM elements *and* their `outerHTML` for the next step. |
| **Attribute** | An attribute name (`href`, `src`, `data-id`, …) | Extracts that attribute from each element in context. Relative `href`/`src` URLs are automatically resolved to absolute. |
| **Index** | One or more indexes, comma-separated (`1`, `1,0`) | Picks a single element by position. **0-based** (`1` = 2nd element). Comma-separated values are tried in order as fallbacks (`1,0` = pick the 2nd, or the 1st if there's no 2nd). Negative indexes count from the end (`-1` = last). |
| **Range** | Indexes/ranges, comma-separated (`0:10`, `70:`, `:5`, `70-100`, `5`) | Picks a subset of elements, always in ascending order. `a:b` is inclusive; an open side (`70:`) means "from 70 to the end". |
| **Text Content** | *(ignored)* | Extracts the visible text of each element (`textContent`, trimmed). Empty results are filtered out. |
| **Regex** | A regex, `/pattern/flags` or plain text | Applies the regex to every string in context and collects matches. The `g` flag is **always** added. If the pattern has capture groups, the **first capture group** is returned; otherwise the full match. Can yield multiple values per string. |
| **Page Title** | *(ignored)* | Returns `document.title`. |
| **Actual Link** | *(ignored)* | Returns the current page's URL. Handy for recording where each row came from. Treated as an "instant" field (never subject to the retry wait below). |
| **Auto Link** | An attribute name (like `Attribute`) | Same as `Attribute`, but marks the field as the **"next page" link** for Auto Harvest, which shows the ▶ button next to the field. |

### Chaining example

To grab the `href` of every item link and then clean it with a regex:

1. **CSS Selector** → `article h2 a`
2. **Attribute** → `href`
3. **Regex** → `/(?:\?|&)id=(\d+)/`

Each step's output feeds the next, and the final results are what get saved.

## Sections (tabs)

Sections let you organize rules into separate contexts. The first section (named `Listagem`) is created for you.

- The **+** button in the tab bar adds a section; **double-click** a tab to rename it.
- Only the **active** section is harvested by default.
- Deleting a section requires at least one to remain.

### Using a section as a link source (listing → detail)

1. Create a second tab with the detail page's extraction rules.
2. On the listing tab, check **"This tab get links to visit in another tab"**.
3. Choose the **field** that holds the links (from the first tab's fields) and the **target tab** (the detail section).
4. Click **Harvest** (or start Auto Harvest). For each link the extension:
   - navigates to the link,
   - runs the detail tab's rules,
   - saves one combined row (first value of each detail field),
   - and finally returns to the original page.

### Static links

Useful when the listing links only load once (infinite scroll, login-gated lists, etc.):

1. Set up the link source as above.
2. **Capturar links agora** — captures the links from the link source field right now and shows the count (no page visits).
3. Check **"Usar links já carregados (estático, não rehavesta a listagem)"** to reuse those stored links instead of re-running the listing rules.
4. **▶ Process links** — visits every (stored) link once, without pagination. Click again to stop.

## Auto Harvest (pagination)

1. In the section you want to harvest, add a field whose chain ends with an **Auto Link** step pointing at the next-page link.
2. Click the **▶** button that appears next to that field.
3. The extension: harvests the current page, saves the results, follows the next-page link, and repeats until no next link is found.
4. Click **⏹** to stop at any time; everything collected so far is kept.

The safety limit is hardcoded (`AUTO_HARVEST_MAX_PAGES = 10000` pages).

## Managing accumulated data

Harvested rows accumulate in `storage.local` under `accumulatedHarvestData` and are written in batches of 50, so data survives closing the sidebar and even reloading the extension.

- **Harvest** — runs the active section's rules on the current page and appends the results.
  - Without a link source, multiple fields are **zipped** into one row per index (parallel arrays).
  - As a link source, each visited link produces one combined row.
- **CSV** — downloads all accumulated data as a semicolon-separated CSV with a UTF-8 BOM (opens correctly in Excel/Sheets). Values are sanitized (newlines → spaces, quotes escaped). Filename: `harvest_export_<domain>_<date>.csv`.
- **JSON** — downloads the accumulated data as JSON. It asks for an optional **primary key field**: if you supply an existing field name, the output is a keyed object (`{ id: { ... } }`); otherwise it's a plain array.
- **New** — clears all accumulated data (asks for confirmation).
- **Copy** — every field result has a copy button (upper-right of its result area).

> Note: the sidebar keeps harvesting in the background while you browse — but only results you save (via **Harvest**, **Auto Harvest** or **Process links**) are accumulated.

## Saving & loading rules

- **Save** (disk icon) — exports the current rule set as JSON: `{domain, sections, activeSectionId}`. Filename: `harvest_rules_<domain>_<date>.json`.
- **Load** (magnifier icon) — opens a new tab with a file picker. Select a rules JSON and the rules are stored; reopen the popup to see them. (A popup file input can't work because the popup closes when it loses focus.)

Example rule files live in `examples/`.

## Known limitations

- Firefox only (uses `sidebar_action`, a Firefox-exclusive API).
- The Auto Harvest safety limit is hardcoded (`AUTO_HARVEST_MAX_PAGES`); a settings page is planned to make this configurable from the UI.
- When a detail section returns empty fields, the extension retries up to 3× with a 10s wait before giving up (except `ActualLink` fields).

## License
MIT License

Copyright (c) 2026 Elieder Sousa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
