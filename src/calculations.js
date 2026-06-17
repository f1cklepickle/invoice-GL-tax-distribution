(function (global) {
  function toCents(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return NaN;
    }

    return Math.round(amount * 100);
  }

  function formatCents(cents) {
    return (cents / 100).toFixed(2);
  }

  function groupItemsByGl(items) {
    return items.reduce((groups, item) => {
      const glNumber = String(item.itemGL).trim();
      const itemCostCents = toCents(item.itemCost);

      if (!groups[glNumber]) {
        groups[glNumber] = {
          glNumber,
          subtotalCents: 0,
          items: [],
        };
      }

      groups[glNumber].subtotalCents += itemCostCents;
      groups[glNumber].items.push(item);

      return groups;
    }, {});
  }

  function getGlSubtotals(items) {
    return Object.values(groupItemsByGl(items)).map((group) => ({
      glNumber: group.glNumber,
      subtotalCents: group.subtotalCents,
      subtotal: formatCents(group.subtotalCents),
    }));
  }

  function getSubtotalCents(items) {
    return items.reduce((sum, item) => sum + toCents(item.itemCost), 0);
  }

  function getTaxCents(invoiceTotal, subtotalCents) {
    return toCents(invoiceTotal) - subtotalCents;
  }

  function isPositiveCents(cents) {
    return Number.isFinite(cents) && cents > 0;
  }

  function validateInvoiceEntry({ invoiceTotal, itemGL, itemCost, existingItems = [] }) {
    const glNumber = String(itemGL || "").trim();
    const itemCostCents = toCents(itemCost);
    const invoiceTotalCents = toCents(invoiceTotal);

    if (!glNumber) {
      return { isValid: false, message: "Please enter GL number" };
    }

    if (!isPositiveCents(itemCostCents)) {
      return { isValid: false, message: "Please enter valid cost" };
    }

    if (!isPositiveCents(invoiceTotalCents)) {
      return { isValid: false, message: "Please enter valid invoice total" };
    }

    const nextSubtotalCents = getSubtotalCents(existingItems) + itemCostCents;

    if (nextSubtotalCents > invoiceTotalCents) {
      return { isValid: false, message: "Invoice total must be at least subtotal" };
    }

    return {
      isValid: true,
      glNumber,
      itemCost: formatCents(itemCostCents),
      itemCostCents,
      invoiceTotalCents,
      nextSubtotalCents,
    };
  }

  const invoiceCalculations = {
    formatCents,
    getGlSubtotals,
    getSubtotalCents,
    getTaxCents,
    groupItemsByGl,
    toCents,
    validateInvoiceEntry,
  };

  global.invoiceCalculations = invoiceCalculations;
})(window);
