(function () {
  const {
    distributeTaxByGl,
    formatCents,
    getGlSubtotals,
    getSubtotalCents,
    getTaxCents,
    groupItemsByGl,
    toCents,
    validateInvoiceEntry,
  } = window.invoiceCalculations;

  const tests = [];

  function test(name, callback) {
    tests.push({ name, callback });
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message} Expected ${expected}, received ${actual}.`);
    }
  }

  function assertDeepEqual(actual, expected, message) {
    const actualJson = JSON.stringify(actual);
    const expectedJson = JSON.stringify(expected);

    if (actualJson !== expectedJson) {
      throw new Error(`${message} Expected ${expectedJson}, received ${actualJson}.`);
    }
  }

  function renderResults(results) {
    const summary = document.querySelector("#summary");
    const list = document.querySelector("#results");
    const passed = results.filter((result) => result.passed).length;

    summary.textContent = `${passed}/${results.length} tests passing`;
    summary.className = passed === results.length ? "pass" : "fail";

    results.forEach((result) => {
      const item = document.createElement("li");
      item.className = result.passed ? "pass" : "fail";
      item.textContent = result.passed ? `PASS: ${result.name}` : `FAIL: ${result.name} - ${result.error}`;
      list.appendChild(item);
    });
  }

  test("converts decimal dollar values to cents", () => {
    assertEqual(toCents("12.34"), 1234, "Dollar string should convert to cents.");
    assertEqual(toCents(0.1 + 0.2), 30, "Floating point math should round to cents.");
  });

  test("formats cents as a two-decimal amount", () => {
    assertEqual(formatCents(1234), "12.34", "Positive cents should format as dollars.");
    assertEqual(formatCents(0), "0.00", "Zero cents should format as zero dollars.");
  });

  test("groups invoice items by GL number", () => {
    const groups = groupItemsByGl([
      { itemGL: "1000", itemCost: "10.00" },
      { itemGL: "2000", itemCost: "5.50" },
      { itemGL: "1000", itemCost: "2.25" },
    ]);

    assertEqual(groups["1000"].subtotalCents, 1225, "Repeated GL should accumulate subtotal.");
    assertEqual(groups["2000"].subtotalCents, 550, "Single GL should retain its subtotal.");
    assertEqual(groups["1000"].items.length, 2, "Repeated GL should retain grouped items.");
  });

  test("calculates invoice subtotal from line items", () => {
    const subtotal = getSubtotalCents([
      { itemGL: "1000", itemCost: "10.00" },
      { itemGL: "2000", itemCost: "5.50" },
      { itemGL: "1000", itemCost: "2.25" },
    ]);

    assertEqual(subtotal, 1775, "Line item costs should add to subtotal cents.");
  });

  test("calculates tax as invoice total less subtotal", () => {
    const tax = getTaxCents("20.00", 1775);

    assertEqual(tax, 225, "Tax should be invoice total less subtotal.");
  });

  test("returns formatted GL subtotals", () => {
    const subtotals = getGlSubtotals([
      { itemGL: "1000", itemCost: "10.00" },
      { itemGL: "2000", itemCost: "5.50" },
      { itemGL: "1000", itemCost: "2.25" },
    ]);

    assertDeepEqual(subtotals, [
      { glNumber: "1000", subtotalCents: 1225, subtotal: "12.25" },
      { glNumber: "2000", subtotalCents: 550, subtotal: "5.50" },
    ], "GL subtotals should include cents and display amounts.");
  });

  test("rejects a blank GL number", () => {
    const result = validateInvoiceEntry({
      invoiceTotal: "25.00",
      itemGL: " ",
      itemCost: "10.00",
    });

    assertEqual(result.isValid, false, "Blank GL should be invalid.");
    assertEqual(result.message, "Please enter GL number", "Blank GL should return the existing message.");
  });

  test("rejects invalid item costs", () => {
    const invalidText = validateInvoiceEntry({
      invoiceTotal: "25.00",
      itemGL: "1000",
      itemCost: "abc",
    });
    const zeroCost = validateInvoiceEntry({
      invoiceTotal: "25.00",
      itemGL: "1000",
      itemCost: "0",
    });
    const negativeCost = validateInvoiceEntry({
      invoiceTotal: "25.00",
      itemGL: "1000",
      itemCost: "-1.00",
    });

    assertEqual(invalidText.isValid, false, "Text cost should be invalid.");
    assertEqual(zeroCost.isValid, false, "Zero cost should be invalid.");
    assertEqual(negativeCost.isValid, false, "Negative cost should be invalid.");
  });

  test("rejects invalid invoice totals", () => {
    const result = validateInvoiceEntry({
      invoiceTotal: "",
      itemGL: "1000",
      itemCost: "10.00",
    });

    assertEqual(result.isValid, false, "Blank invoice total should be invalid.");
    assertEqual(result.message, "Please enter valid invoice total", "Invalid total should return a clear message.");
  });

  test("rejects entries that would make subtotal exceed invoice total", () => {
    const result = validateInvoiceEntry({
      invoiceTotal: "15.00",
      itemGL: "1000",
      itemCost: "10.00",
      existingItems: [
        { itemGL: "2000", itemCost: "8.00" },
      ],
    });

    assertEqual(result.isValid, false, "Subtotal over invoice total should be invalid.");
    assertEqual(result.message, "Invoice total must be at least subtotal", "Over-subtotal entries should explain the issue.");
  });

  test("normalizes valid entry values", () => {
    const result = validateInvoiceEntry({
      invoiceTotal: "25.00",
      itemGL: " 1000 ",
      itemCost: "10",
    });

    assertEqual(result.isValid, true, "Valid entry should pass.");
    assertEqual(result.glNumber, "1000", "GL number should be trimmed.");
    assertEqual(result.itemCost, "10.00", "Item cost should be formatted.");
    assertEqual(result.nextSubtotalCents, 1000, "Next subtotal should include the new item.");
  });

  test("distributes tax across GL subtotals", () => {
    const distribution = distributeTaxByGl({
      invoiceTotal: "33.00",
      items: [
        { itemGL: "1000", itemCost: "10.00" },
        { itemGL: "2000", itemCost: "20.00" },
      ],
    });

    assertDeepEqual(distribution.map((gl) => ({
      glNumber: gl.glNumber,
      glTax: gl.glTax,
      glAfterTax: gl.glAfterTax,
    })), [
      { glNumber: "1000", glTax: "1.00", glAfterTax: "11.00" },
      { glNumber: "2000", glTax: "2.00", glAfterTax: "22.00" },
    ], "Tax should distribute by each GL subtotal share.");
  });

  test("balances rounding so GL totals tie to invoice total", () => {
    const distribution = distributeTaxByGl({
      invoiceTotal: "30.01",
      items: [
        { itemGL: "1000", itemCost: "10.00" },
        { itemGL: "2000", itemCost: "10.00" },
        { itemGL: "3000", itemCost: "10.00" },
      ],
    });
    const glTotalCents = distribution.reduce((sum, gl) => sum + gl.glAfterTaxCents, 0);

    assertEqual(glTotalCents, 3001, "Distributed GL totals should tie to invoice total cents.");
    assertDeepEqual(distribution.map((gl) => gl.glTax), ["0.01", "0.00", "0.00"], "Rounding remainder should be assigned once.");
  });

  const results = tests.map(({ name, callback }) => {
    try {
      callback();
      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  });

  renderResults(results);
})();
