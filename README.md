# Invoice GL Tax Distribution

A browser-based invoice coding helper for grouping invoice line items by GL code
and distributing invoice tax across those GL groups.

I started this project as a hand-coded HTML, CSS, and JavaScript learning
project. The workflow is based on my own accounts payable and central supply
invoice review work, especially larger weekly order invoices that require
line-item GL coding and tax distribution.

I now use AI assistance to help refactor, document, and improve the project while
keeping the requirements, review, and AP workflow decisions grounded in my own
experience.

## What The App Does

The app helps review an invoice by:

- accepting an invoice total
- accepting line items with a GL code, amount, and optional description
- grouping line items by GL code
- calculating the line-item subtotal
- calculating tax as the difference between invoice total and subtotal
- distributing tax across GL groups based on each group's share of the subtotal
- showing GL-level subtotals, tax allocation, and total after tax

## Example Workflow

1. Enter the full invoice total.
2. Enter a line item's GL code.
3. Enter the line item amount.
4. Optionally enter a line item description.
5. Add the item to the invoice.
6. Repeat until all invoice lines are entered.
7. Review the grouped GL totals and tax distribution.

## Why This Is Useful

Invoice coding often requires reviewing line items, assigning GL codes, and
making sure totals tie back to the invoice. This app supports that review process
by organizing entered line items and showing how tax can be distributed across GL
categories.

I use this tool personally to support large weekly invoice reviews. For larger
invoices, it helps reduce my manual calculation and review time by roughly 15-20
minutes by grouping line items by GL code and calculating tax distribution.

This is not a company-wide system, is not integrated with employer software, and
should not be treated as an official accounting system.

## Technologies

- HTML
- CSS
- JavaScript
- Browser DOM APIs

No build step or package installation is currently required.

## How To Run

Open `index.html` in a web browser.

Because this is a static browser app, it can run locally without a server. Future
features may add browser-local preferences, saved invoice records, and
import/export support.

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

- The app is an early browser prototype.
- It is used personally, not deployed company-wide.
- Saved invoice storage is not implemented yet.
- Import/export is not implemented yet.
- Browser preference settings are not implemented yet.
- Tax distribution and rounding behavior still need additional validation and
  polish.
- The app is not integrated with any accounting, ERP, AP automation, or approval
  system.

## Planned Improvements

Planned work is intentionally split into small PRs:

1. Refresh project documentation and workflow instructions.
2. Clean up HTML/CSS structure and labels.
3. Improve invoice validation and tax rounding.
4. Add fake demo invoice data.
5. Turn toolbar items into real Profile, Settings, and Shortcuts panels.
6. Add browser storage capability checks.
7. Save profile preferences in the browser.
8. Add invoice behavior settings such as light/dark mode and tax distribution
   on/off.
9. Add browser-saved GL shortcuts.
10. Add a clean invoice summary and copy action.
11. Save and reopen coded invoices with IndexedDB.
12. Add invoice import/export as a local-file backup option.
13. Add a manual testing checklist.
14. Add a resume/project summary document with honest draft wording.

## Resume Positioning

This project can be described as a practical invoice coding and tax distribution
tool built around a real AP workflow. It demonstrates process-improvement
thinking, invoice review logic, and frontend development practice.

It is fair to say that it supports my personal weekly invoice review workflow and
helps reduce manual calculation time on larger invoices. Do not describe it as a
company-wide tool, official employer system, or fully automated AP process.
