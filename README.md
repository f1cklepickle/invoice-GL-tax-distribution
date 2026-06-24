# Invoice GL Tax Distribution

A static browser app for reviewing invoice coding by grouping line items by GL
code and distributing invoice tax across those GL groups.

This project started as a hand-coded HTML, CSS, and JavaScript learning project.
The workflow is based on my own accounts payable and central supply invoice
review experience, especially larger weekly order invoices that require
line-item GL coding and tax distribution.

I use AI assistance to help refactor, document, and improve the project while
keeping requirements, review, and AP workflow decisions grounded in my own
experience.

## What The App Does

The app supports invoice coding review by:

- accepting an invoice total
- accepting purchase and refund line items with a GL code, amount, and optional
  item name
- grouping line items by GL code
- calculating purchase subtotal, refund/credit total, net item subtotal, and tax
  or small invoice difference
- distributing tax across GL groups based on purchase subtotal share
- balancing rounding so distributed GL totals tie back to the invoice total
- showing GL-level subtotals, tax allocation, and total after tax
- generating a coded invoice summary that can be copied for review notes

## Current Features

- Fake demo invoice data and reset flow
- Purchase and refund line support
- GL grouping and tax distribution
- Rounding adjustment tests for GL totals
- Toolbar panels for Profile, Settings, and Shortcuts
- Browser capability checks for preferences, saved invoices, and file export
- Profile preferences saved in `localStorage`
- Invoice display/settings saved in `localStorage`
- Browser-saved GL shortcuts and item-name autocomplete shortcuts
- Coded invoice summary view with copy-to-clipboard support
- Keyboard tab priority for the main invoice entry workflow

## Example Workflow

1. Enter the full invoice total.
2. Enter a line item's GL code, or use a saved GL shortcut.
3. Enter the line item amount.
4. Optionally enter or autocomplete a line item name.
5. Add the item to the invoice.
6. Repeat until all invoice lines are entered.
7. Review grouped GL totals and tax distribution.
8. Open the coded summary view and copy the summary if useful.

## Why This Is Useful

Invoice coding often requires reviewing line items, assigning GL codes, and
making sure totals tie back to the invoice. This app supports that review process
by organizing entered line items and showing how tax can be distributed across GL
categories.

This is a personal workflow tool and portfolio project. It is not a company-wide
tool, is not an official employer system, is not integrated with employer
software, and should not be treated as an official accounting system.

## Technologies

- HTML
- CSS
- JavaScript
- Browser DOM APIs
- `localStorage` for preferences and shortcuts

No build step or package installation is currently required.

## How To Run

Open `index.html` in a web browser.

Because this is a static browser app, it can run locally without a server.

To run the calculation checks, open:

```text
tests/run-tests.html
```

The current calculation test page reports `21/21 tests passing`.

## Data And Privacy

This repository should only contain fake/demo invoice data. The app's workflow is
based on real AP tasks, but the repository should not contain real workplace
records.

Do not add:

- private employer data
- real vendor names
- real invoice numbers
- real GL lists
- confidential amounts
- workplace-specific approval or coding rules

## Current Limitations

- The app is a static browser project, not a deployed accounting system.
- Saved coded invoice records are not implemented yet.
- Import/export is not implemented yet.
- Preferences and shortcuts are browser-local and can be lost if browser data is
  cleared.
- Clipboard behavior depends on browser support and permissions.
- The app is not integrated with any accounting, ERP, AP automation, or approval
  system.

## Planned Improvements

Planned work is intentionally split into small PRs:

1. Save, load, and delete coded invoices using IndexedDB.
2. Export/import coded invoices as local files for backup and portability.
3. Add a manual validation checklist for core workflows and edge cases.
4. Continue small accessibility and layout polish as workflows are tested.

## Resume Positioning

This project can be described as a practical invoice coding and tax distribution
tool built around a real AP workflow. It demonstrates process-improvement
thinking, invoice review logic, browser storage basics, and frontend development
practice.

Use modest wording. It is fair to say the app supports a personal invoice review
workflow and helps standardize line-item grouping, tax distribution, and summary
review. Do not describe it as a company-wide tool, official employer system, or
fully automated AP process.

See [docs/resume-project-summary.md](docs/resume-project-summary.md) for draft
resume wording options.
