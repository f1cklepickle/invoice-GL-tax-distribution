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

  function distributeRemainder(distributions, remainingCents) {
    return distributions
      .map((distribution, index) => ({ ...distribution, index }))
      .sort((a, b) => b.remainder - a.remainder || a.index - b.index)
      .map((distribution, sortedIndex) => ({
        ...distribution,
        taxCents: distribution.taxCents + (sortedIndex < remainingCents ? 1 : 0),
      }))
      .sort((a, b) => a.index - b.index)
      .map(({ index, remainder, ...distribution }) => distribution);
  }

  function distributeTaxByGl({ invoiceTotal, items }) {
    const subtotalCents = getSubtotalCents(items);
    const taxCents = getTaxCents(invoiceTotal, subtotalCents);

    if (subtotalCents <= 0 || taxCents <= 0) {
      return getGlSubtotals(items).map((group) => ({
        glNumber: group.glNumber,
        glSubtotalCents: group.subtotalCents,
        glTaxCents: 0,
        glAfterTaxCents: group.subtotalCents,
        glPercentage: subtotalCents > 0 ? ((group.subtotalCents / subtotalCents) * 100).toFixed(2) : "0.00",
        glTotal: group.subtotal,
        glTax: "0.00",
        glAfterTax: group.subtotal,
      }));
    }

    const initialDistributions = getGlSubtotals(items).map((group) => {
      const exactTax = (group.subtotalCents * taxCents) / subtotalCents;
      const baseTaxCents = Math.floor(exactTax);

      return {
        glNumber: group.glNumber,
        glSubtotalCents: group.subtotalCents,
        taxCents: baseTaxCents,
        remainder: exactTax - baseTaxCents,
      };
    });

    const assignedTaxCents = initialDistributions.reduce((sum, group) => sum + group.taxCents, 0);
    const balancedDistributions = distributeRemainder(initialDistributions, taxCents - assignedTaxCents);

    return balancedDistributions.map((group) => {
      const glAfterTaxCents = group.glSubtotalCents + group.taxCents;

      return {
        glNumber: group.glNumber,
        glSubtotalCents: group.glSubtotalCents,
        glTaxCents: group.taxCents,
        glAfterTaxCents,
        glPercentage: ((group.glSubtotalCents / subtotalCents) * 100).toFixed(2),
        glTotal: formatCents(group.glSubtotalCents),
        glTax: formatCents(group.taxCents),
        glAfterTax: formatCents(glAfterTaxCents),
      };
    });
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
    distributeTaxByGl,
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
