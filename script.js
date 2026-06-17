let list = [];
let itemIdNum = 1;

const DEMO_INVOICE_TOTAL = "142.36";
const DEMO_INVOICE_ITEMS = [
  {
    itemGL: "6100",
    itemType: "purchase",
    itemName: "Demo printer paper",
    itemCost: "42.50",
  },
  {
    itemGL: "6200",
    itemType: "purchase",
    itemName: "Demo desk organizer",
    itemCost: "18.75",
  },
  {
    itemGL: "6300",
    itemType: "purchase",
    itemName: "Demo toner sampler",
    itemCost: "31.20",
  },
  {
    itemGL: "6100",
    itemType: "refund",
    itemName: "Demo returned supply credit",
    itemCost: "-4.50",
  },
  {
    itemGL: "6200",
    itemType: "purchase",
    itemName: "Demo shipping supplies",
    itemCost: "37.40",
  },
];

const {
  distributeTaxByGl,
  formatCents,
  getPurchaseSubtotalCents,
  getRefundTotalCents,
  getSubtotalCents,
  getSmallDifferenceNotice,
  getTaxCents,
  toCents,
  validateInvoiceEntry,
} = window.invoiceCalculations;

const targetInput = document.querySelectorAll("input");
const focusTotal = document.querySelector("#inputTotal");
const searchValue = document.getElementById("inputSearch");
const searchBtn = document.querySelector(".searchBtn");
const loadDemoButton = document.getElementById("load-demo-button");
const resetInvoiceButton = document.getElementById("reset-invoice-button");
const toolbarMenuButtons = document.querySelectorAll(".toolbarMenuButton");
const toolbarDropdown = document.getElementById("toolbar-dropdown");
const menuBackdrop = document.getElementById("menu-backdrop");
const toolbarPanels = document.querySelectorAll(".toolbarPanel");
const capabilityStatusElements = {
  preferences: document.getElementById("preference-storage-status"),
  invoices: document.getElementById("invoice-storage-status"),
  fileExport: document.getElementById("file-export-status"),
};

targetInput.forEach((input) => {
  input.addEventListener("focus", function () {
    input.classList.add("input-focus");
  });

  input.addEventListener("blur", function () {
    input.classList.toggle("input-focus");
  });
});

focusTotal.focus();

function isToolbarMenuOpen() {
  return !toolbarDropdown.hidden;
}

function openToolbarMenu(panelName) {
  toolbarDropdown.hidden = false;
  menuBackdrop.hidden = false;

  toolbarMenuButtons.forEach((button) => {
    const isActive = button.dataset.menuTarget === panelName;
    button.setAttribute("aria-pressed", String(isActive));
  });

  toolbarPanels.forEach((panel) => {
    panel.classList.toggle("isActive", panel.dataset.panel === panelName);
  });
}

function closeToolbarMenu() {
  toolbarDropdown.hidden = true;
  menuBackdrop.hidden = true;

  toolbarMenuButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
  });

  toolbarPanels.forEach((panel) => {
    panel.classList.remove("isActive");
  });
}

function canUseLocalStorage() {
  const testKey = "invoice-tax-distribution-storage-test";

  try {
    localStorage.setItem(testKey, "available");
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

function canUseIndexedDb() {
  const testDbName = "invoice-tax-distribution-indexeddb-test";

  if (!("indexedDB" in window)) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    let isSettled = false;
    const request = indexedDB.open(testDbName, 1);

    function finish(isSupported) {
      if (isSettled) {
        return;
      }

      isSettled = true;
      resolve(isSupported);
    }

    request.onerror = function () {
      finish(false);
    };

    request.onblocked = function () {
      finish(false);
    };

    request.onsuccess = function () {
      request.result.close();
      indexedDB.deleteDatabase(testDbName);
      finish(true);
    };

    window.setTimeout(function () {
      finish(false);
    }, 1000);
  });
}

function canExportFiles() {
  const testAnchor = document.createElement("a");

  return (
    "Blob" in window &&
    "URL" in window &&
    typeof URL.createObjectURL === "function" &&
    "download" in testAnchor
  );
}

function updateCapabilityStatus(element, isSupported) {
  element.innerText = isSupported ? "Supported" : "Unavailable";
  element.classList.toggle("isSupported", isSupported);
  element.classList.toggle("isUnsupported", !isSupported);
}

async function renderCapabilityStatuses() {
  updateCapabilityStatus(capabilityStatusElements.preferences, canUseLocalStorage());
  updateCapabilityStatus(capabilityStatusElements.fileExport, canExportFiles());
  updateCapabilityStatus(capabilityStatusElements.invoices, await canUseIndexedDb());
}

function createInvoiceItem({ itemGL, itemType, itemName, itemCost }) {
  const nextItemId = itemIdNum;
  const newItem = {
    itemGL,
    itemType,
    itemName,
    itemCost,
    itemId: nextItemId,
    btnId: nextItemId - 1,
  };

  itemIdNum++;
  return newItem;
}

function resetRenderedInvoice() {
  document.getElementById("invoice-total").innerText = "";
  document.getElementById("purchase-subtotal").innerText = "";
  document.getElementById("refund-total").innerText = "";
  document.getElementById("subtotal").innerText = "";
  document.getElementById("tax").innerText = "";
  document.getElementById("adjustment-note").innerText = "";
  document.querySelector("#marksExtra").innerHTML = "";
  document.querySelector("#gl-table").innerHTML = "";
}

function renderInvoice() {
  resetRenderedInvoice();

  if (list.length === 0) {
    return;
  }

  const total = document.getElementById("inputTotal").value;
  const subTotalCents = getSubtotalCents(list);
  const purchaseSubtotalCents = getPurchaseSubtotalCents(list);
  const refundTotalCents = getRefundTotalCents(list);
  const taxCents = getTaxCents(total, subTotalCents);

  document.getElementById("invoice-total").innerText = formatCents(toCents(total));
  document.getElementById("purchase-subtotal").innerText = formatCents(purchaseSubtotalCents);
  document.getElementById("refund-total").innerText = formatCents(refundTotalCents);
  document.getElementById("subtotal").innerText = formatCents(subTotalCents);
  document.getElementById("tax").innerText = formatCents(taxCents);
  document.getElementById("adjustment-note").innerText = getSmallDifferenceNotice(taxCents);

  const glTable = document.querySelector("#gl-table");
  glTable.style.cssText = "width: 100%;";

  const glDetails = distributeTaxByGl({
    invoiceTotal: total,
    items: list,
  });

  glDetails.forEach((gl) => {
    const glRow = document.createElement("tr");
    glRow.setAttribute("id", `gl-row${gl.glNumber}`);
    glRow.style.cssText = "display: flex;";

    const glNumberCell = document.createElement("th");
    glNumberCell.innerText = `GL Number: ${gl.glNumber}`;

    const glSubtotalCell = document.createElement("th");
    glSubtotalCell.innerText = `GL Subtotal: ${gl.glTotal}`;

    const glTotalCell = document.createElement("th");
    glTotalCell.innerText = `GL Total: ${gl.glAfterTax}`;

    const glTaxCell = document.createElement("th");
    glTaxCell.innerText = `GL Tax: ${gl.glTax}`;

    const glDivider = document.createElement("div");
    glDivider.setAttribute("data-glNumber", `${gl.glNumber}`);
    glDivider.setAttribute("id", "glDivider");

    const itemBox = document.createElement("div");
    itemBox.setAttribute("data-glItemBox", `${gl.glNumber}`);
    itemBox.classList.add("itemBox");

    const bookmarkBox = document.querySelector("#marksExtra");
    const glBookmark = document.createElement("li");
    glBookmark.innerHTML = `<a>GL Number: <strong>${gl.glNumber}</strong> - GL Total: <strong>${gl.glAfterTax}</strong></a>`;
    glBookmark.classList.add(`glMark${gl.glNumber}`);
    glBookmark.setAttribute("tabindex", "-1");
    glBookmark.setAttribute("id", "linkSelector");
    glBookmark.setAttribute("href", `#glMark${gl.glNumber}`);

    glBookmark.addEventListener("click", function (glFocus) {
      glFocus.preventDefault();
      const glTarget = document.getElementById(`gl-row${gl.glNumber}`);
      glTarget.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    });

    bookmarkBox.appendChild(glBookmark);
    glRow.appendChild(glNumberCell);
    glRow.appendChild(glSubtotalCell);
    glRow.appendChild(glTaxCell);
    glRow.appendChild(glTotalCell);
    glDivider.appendChild(glRow);
    glDivider.appendChild(itemBox);
    glTable.appendChild(glDivider);
  });

  list.forEach((item) => {
    const targetItemBox = document.querySelector(`div[data-glItemBox='${item.itemGL}']`);

    const listItem = document.createElement("tr");
    listItem.style.cssText = "margin-bottom: 5px; display: flex;";
    listItem.classList.add(`${item.itemGL}`);

    const listItemGL = document.createElement("td");
    listItemGL.innerText = `Item GL: ${item.itemGL}`;

    const listItemCost = document.createElement("td");
    listItemCost.innerText = `Item Cost: ${item.itemCost}`;

    const listItemType = document.createElement("td");
    listItemType.innerText = `Line Type: ${item.itemType === "refund" ? "Refund" : "Purchase"}`;

    const listItemName = document.createElement("td");
    listItemName.innerText = `Item Name: ${item.itemName}`;

    const listItemId = document.createElement("td");
    listItemId.innerText = `Item ID: ${item.itemId}`;

    const listItemX = document.createElement("td");
    listItemX.style.cssText = "flex-grow: -1;";
    listItemX.classList.add("xBtnContainer");

    const xBtn = document.createElement("button");
    xBtn.id = `xBtn-${item.btnId}`;
    xBtn.setAttribute("tabindex", "-1");
    xBtn.classList.add("delBtn");
    xBtn.dataset.targetBtn = `${item.btnId}`;
    xBtn.innerText = "x";
    xBtn.addEventListener("click", removeInvoiceItem);

    listItemX.appendChild(xBtn);
    listItem.appendChild(listItemGL);
    listItem.appendChild(listItemType);
    listItem.appendChild(listItemCost);
    listItem.appendChild(listItemName);
    listItem.appendChild(listItemId);
    listItem.appendChild(listItemX);

    targetItemBox.appendChild(listItem);
  });
}

function removeInvoiceItem(event) {
  const buttonPressed = event.target.closest("button");
  const targetXBtn = buttonPressed.dataset.targetBtn;
  const targetIndex = list.findIndex((item) => Number(item.btnId) === Number(targetXBtn));

  if (targetIndex !== -1) {
    list.splice(targetIndex, 1);
    reindexInvoiceItems();
    renderInvoice();
  }
}

function reindexInvoiceItems() {
  itemIdNum = 1;
  list = list.map((item, index) => ({
    ...item,
    itemId: itemIdNum++,
    btnId: index,
  }));
}

function addNewGl() {
  const total = document.getElementById("inputTotal").value;
  const validation = validateInvoiceEntry({
    invoiceTotal: total,
    itemGL: document.getElementById("inputGl").value,
    itemCost: document.getElementById("inputCost").value,
    itemType: document.getElementById("inputType").value,
    existingItems: list,
  });

  if (!validation.isValid) {
    alert(validation.message);
    return;
  }

  list.push(createInvoiceItem({
    itemGL: validation.glNumber,
    itemType: validation.itemType,
    itemName: document.getElementById("inputName").value,
    itemCost: validation.itemCost,
  }));

  renderInvoice();

  const costFocus = document.getElementById("inputCost");
  costFocus.addEventListener("focus", function () {
    this.select();
  });

  costFocus.blur();
  costFocus.focus();
}

function loadDemoInvoice() {
  document.getElementById("inputTotal").value = DEMO_INVOICE_TOTAL;
  document.getElementById("inputType").value = "purchase";
  document.getElementById("inputGl").value = "";
  document.getElementById("inputCost").value = "";
  document.getElementById("inputName").value = "";
  searchValue.value = "";
  document.querySelector(".resultsContainer").innerText = "Search Results";

  itemIdNum = 1;
  list = DEMO_INVOICE_ITEMS.map((item) => createInvoiceItem(item));
  renderInvoice();
  document.getElementById("inputCost").focus();
}

function resetInvoice() {
  list = [];
  itemIdNum = 1;
  document.getElementById("inputTotal").value = "";
  document.getElementById("inputType").value = "purchase";
  document.getElementById("inputGl").value = "";
  document.getElementById("inputCost").value = "";
  document.getElementById("inputName").value = "";
  searchValue.value = "";
  document.querySelector(".resultsContainer").innerText = "Search Results";
  resetRenderedInvoice();
  focusTotal.focus();
}

function searchList() {
  const results = document.querySelector(".resultsContainer");
  results.innerText = "";
  const searchCost = Number(searchValue.value).toFixed(2);

  if (searchValue.value === "") {
    results.innerText = "Search Results";
    return;
  }

  const matchingItems = list.filter((item) => item.itemCost === searchCost);

  if (matchingItems.length === 0) {
    results.innerText = "No matches";
    return;
  }

  matchingItems.forEach((item) => {
      const glRow = document.createElement("tr");
      glRow.setAttribute("id", `gl-row${item.itemGL}`);
      glRow.style.cssText = "display: flex; font-size: 20px; width: 1100px; color: black; border: ridge; border-width: 5px; border-radius: 5px; border-color: rgb(144, 164, 241);";

      const itemGlCell = document.createElement("th");
      itemGlCell.innerText = `GL Number: ${item.itemGL}`;
      itemGlCell.style.cssText = "background-color: rgb(206, 215, 250);";

      const itemNameCell = document.createElement("th");
      itemNameCell.innerText = `Item Name: ${item.itemName}`;
      itemNameCell.style.cssText = "background-color: rgb(206, 215, 250);";

      const itemCostCell = document.createElement("th");
      itemCostCell.innerText = `Item cost: ${item.itemCost}`;
      itemCostCell.style.cssText = "background-color: rgb(206, 215, 250);";

      const itemIdCell = document.createElement("th");
      itemIdCell.innerText = `Item Id: ${item.itemId}`;
      itemIdCell.style.cssText = "background-color: rgb(206, 215, 250);";

      glRow.appendChild(itemGlCell);
      glRow.appendChild(itemNameCell);
      glRow.appendChild(itemCostCell);
      glRow.appendChild(itemIdCell);
      results.appendChild(glRow);
  });
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !isToolbarMenuOpen() && event.target.tagName !== "BUTTON") {
    event.preventDefault();
    addNewGl();
  }
});

toolbarMenuButtons.forEach((button) => {
  button.addEventListener("click", function () {
    openToolbarMenu(button.dataset.menuTarget);
  });
});

toolbarDropdown.addEventListener("click", function (event) {
  event.stopPropagation();
});

menuBackdrop.addEventListener("click", closeToolbarMenu);
searchBtn.addEventListener("click", searchList);
loadDemoButton.addEventListener("click", loadDemoInvoice);
resetInvoiceButton.addEventListener("click", resetInvoice);
renderCapabilityStatuses();
