# Harvest Scraper

*When your automated web scraping fails, use this.*


A Firefox extension for extracting (scraping) data from web pages using configurable rules, no code required. It runs as a sidebar, so you can browse the site normally while capturing data.

## Features

- **Chained rules per field**: each field can combine multiple steps (CSS Selector → Attribute → Regex, etc.) to refine extraction.
- **Available rule types**:
  - `CSS Selector` — selects elements via a CSS selector.
  - `Attribute` — extracts the value of an HTML attribute.
  - `Index` — picks a specific element by position (supports fallback, e.g. `1,0`).
  - `Text Content` — extracts the visible text of an element.
  - `Regex` — applies a regular expression (uses the first capture group, if any).
  - `Auto Link` — marks the field that points to the next page (automatic pagination).
- **Sections (tabs)**: lets you split rules into multiple contexts — for example, one tab to capture links from a listing page and another to extract data from each individual page.
  - A tab can be configured as a *link source*: for each link found by one of its fields, the extension visits the page, runs another tab's rules (detail) and saves a combined row.
- **Auto Harvest**: automatically navigates through pages following the `Auto Link` rule, collecting data on each one until no next page is found (or the safety page limit is reached).
- **Incremental accumulation**: captured data is progressively saved to the extension's `storage.local`, so you can pause and resume without losing progress.
- **CSV export**: downloads all accumulated data as `.csv`, ready to open in Excel/Sheets.
- **Save/Load rules as JSON**: lets you export the configured rule set and re-import it later (or share it across machines/sites).

## Installation (developer mode)

1. Clone the repository.
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on** and select the project's `manifest.json` file.
4. Click the extension icon in the toolbar to open the sidebar.

## Usage

1. Navigate to the page you want to capture.
2. Add a field (**Add row**), give it a name and define its extraction rule(s).
3. Click **Harvest** to test extraction on the current page.
4. To capture multiple pages:
   - Set up a field with the `Auto Link` type pointing to the next page's link.
   - Click the ▶ button next to that field to start automatic capture.
5. To capture detail-page data from a listing page:
   - Create a second tab with the detail page's extraction rules.
   - On the listing tab, check **"This tab looks for links to visit in another tab"**, choose the field that holds the links, and the target tab.
6. Use **Download** to export the accumulated data as CSV, or **New** to clear the history and start a new collection.

## Known limitations

- Firefox only (uses `sidebar_action`, a Firefox-exclusive API).
- The Auto Harvest safety limit is hardcoded (`AUTO_HARVEST_MAX_PAGES`); a settings page is planned to make this configurable from the UI.

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
