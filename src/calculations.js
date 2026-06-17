(function (global) {
  const SMALL_TOTAL_DIFFERENCE_LIMIT_CENTS = 10;

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
        adjustmentCents: distribution.adjustmentCents + (sortedIndex < remainingCents ? 1 : 0),
      }))
      .sort((a, b) => a.index - b.index)
      .map(({ index, remainder, ...distribution }) => distribution);
  }

  function distributeTaxByGl({ invoiceTotal, items }) {
    const subtotalCents = getSubtotalCents(items);
    const taxCents = getTaxCents(invoiceTotal, subtotalCents);
    const adjustmentSign = taxCents < 0 ? -1 : 1;
    const absoluteTaxCents = Math.abs(taxCents);

    if (subtotalCents <= 0 || absoluteTaxCents === 0) {
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
      const exactTax = (group.subtotalCents * absoluteTaxCents) / subtotalCents;
      const baseAdjustmentCents = Math.floor(exactTax);

      return {
        glNumber: group.glNumber,
        glSubtotalCents: group.subtotalCents,
        adjustmentCents: baseAdjustmentCents,
        remainder: exactTax - baseAdjustmentCents,
      };
    });

    const assignedTaxCents = initialDistributions.reduce((sum, group) => sum + group.adjustmentCents, 0);
    const balancedDistributions = distributeRemainder(initialDistributions, absoluteTaxCents - assignedTaxCents);

    return balancedDistributions.map((group) => {
      const glTaxCents = group.adjustmentCents * adjustmentSign;
      const glAfterTaxCents = group.glSubtotalCents + glTaxCents;

      return {
        glNumber: group.glNumber,
        glSubtotalCents: group.glSubtotalCents,
        glTaxCents,
        glAfterTaxCents,
        glPercentage: ((group.glSubtotalCents / subtotalCents) * 100).toFixed(2),
        glTotal: formatCents(group.glSubtotalCents),
        glTax: formatCents(glTaxCents),
        glAfterTax: formatCents(glAfterTaxCents),
      };
    });
  }

  function getSmallDifferenceNotice(differenceCents) {
    if (differenceCents === 0 || Math.abs(differenceCents) > SMALL_TOTAL_DIFFERENCE_LIMIT_CENTS) {
      return "";
    }

    return `Small invoice total difference of ${formatCents(Math.abs(differenceCents))} was distributed across GL totals.`;
  }

  function isPositiveCents(cents) {
    return Number.isFinite(cents) && cents > 0;
  }

  function validateInvoiceEntry({ invoiceTotal, itemGL, itemCost, existingItems = [] }) {
    const invoiceTotalValue = String(invoiceTotal || "").trim();
    const glNumber = String(itemGL || "").trim();
    const itemCostValue = String(itemCost || "").trim();
    const itemCostCents = toCents(itemCost);
    const invoiceTotalCents = toCents(invoiceTotal);

    if (!invoiceTotalValue) {
      return { isValid: false, message: "Please enter invoice total" };
    }

    if (!isPositiveCents(invoiceTotalCents)) {
      return { isValid: false, message: "Please enter valid invoice total" };
    }

    if (!glNumber) {
      return { isValid: false, message: "Please enter GL number" };
    }

    if (!itemCostValue) {
      return { isValid: false, message: "Please enter item cost" };
    }

    if (!isPositiveCents(itemCostCents)) {
      return { isValid: false, message: "Please enter valid cost" };
    }

    const nextSubtotalCents = getSubtotalCents(existingItems) + itemCostCents;

    if (nextSubtotalCents - invoiceTotalCents > SMALL_TOTAL_DIFFERENCE_LIMIT_CENTS) {
      return { isValid: false, message: "Invoice total should be greater than item subtotal" };
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
    getSmallDifferenceNotice,
    getTaxCents,
    groupItemsByGl,
    toCents,
    validateInvoiceEntry,
  };

  global.invoiceCalculations = invoiceCalculations;
})(window);
