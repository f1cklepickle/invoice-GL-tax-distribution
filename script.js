let list = []
let itemIdNum = 1
let newList = []
const {
  distributeTaxByGl,
  formatCents,
  getSubtotalCents,
  getSmallDifferenceNotice,
  getTaxCents,
  toCents,
  validateInvoiceEntry,
} = window.invoiceCalculations;

function getBtnId() {
  return list.length;
}

const targetInput = document.querySelectorAll("input");

  targetInput.forEach(input => {

    input.addEventListener('focus', function() {
      input.classList.add("input-focus");
  })
    input.addEventListener('blur', function() {
      input.classList.toggle("input-focus");
    })
   
  });

const focusTotal = document.querySelector("#inputTotal");
  focusTotal.focus();

function addNewGl(item = null) {

  const total = document.getElementById("inputTotal").value;
  const validation = item ? null : validateInvoiceEntry({
    invoiceTotal: total,
    itemGL: document.getElementById("inputGl").value,
    itemCost: document.getElementById("inputCost").value,
    existingItems: list,
  });

  if (validation && !validation.isValid) {
    alert(validation.message);
    return;
  }
  
      const newItem = item || {
        itemGL: validation.glNumber,
        itemName: document.getElementById("inputName").value,
        itemCost: validation.itemCost,
        itemId: itemIdNum,
        btnId: getBtnId(),
        removeItem: function(event) {
          const buttonPressed = event.target.closest("button");

          const targetXBtn = buttonPressed.dataset.targetBtn;

          const targetIndex = list.findIndex(i => Number(i.btnId) === Number(targetXBtn));
            if (targetIndex !== -1) {
              list.splice(targetIndex, 1);
              newList = [...list];
              renderList()
            }
          }
        }

    if(!item) {
    list.push(newItem);
        itemIdNum++;    
    }
    const subTotalCents = getSubtotalCents(list);
    const taxCents = getTaxCents(total, subTotalCents);

    document.getElementById("invoice-total").innerText = formatCents(toCents(total));
    document.getElementById("subtotal").innerText = formatCents(subTotalCents);
    document.getElementById("tax").innerText = formatCents(taxCents);
    document.getElementById("adjustment-note").innerText = getSmallDifferenceNotice(taxCents);


    const glTable = document.querySelector("#gl-table");
      glTable.style.cssText = "width: 100%;"
      glTable.innerHTML = "";

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
      glNumberCell.style.cssText = "";

    const glSubtotalCell = document.createElement("th");
      glSubtotalCell.innerText = `GL Subtotal: ${gl.glTotal}`;
      glSubtotalCell.style.cssText = "";

    const glTotalCell = document.createElement("th");
      glTotalCell.innerText = `GL Total: ${gl.glAfterTax}`;
      glTotalCell.style.cssText = "";

    const glTaxCell = document.createElement("th");
      glTaxCell.innerText = `GL Tax: ${gl.glTax}`;
      glTaxCell.style.cssText = "";

    const glDivider = document.createElement("div");
      glDivider.setAttribute("data-glNumber", `${gl.glNumber}`);
      glDivider.setAttribute("id", "glDivider");

    const itemBox = document.createElement("div");
      itemBox.setAttribute("data-glItemBox", `${gl.glNumber}`)
      itemBox.classList.add('itemBox')
      itemBox.style.cssText = ""

    const bookmarkBox = document.querySelector("#marksExtra");

    if(!bookmarkBox.querySelector(`.glMark${gl.glNumber}`)){

    const glBookmark = document.createElement("li");
      glBookmark.innerHTML = `<a>GL Number: <strong>${(gl.glNumber)}</strong> - GL Total: <strong>${gl.glAfterTax}</strong></a>`;
      glBookmark.classList.add(`glMark${gl.glNumber}`);
      glBookmark.setAttribute("tabindex", "-1");
      glBookmark.setAttribute("id", "linkSelector")
      glBookmark.setAttribute("href", `#glMark${gl.glNumber}`)
      glBookmark.style.cssText = "";

      bookmarkBox.appendChild(glBookmark);

    const glLinks = document.getElementsByClassName(`glMark${gl.glNumber}`);
      Array.from(glLinks).forEach(link => {
        link.addEventListener('click', function (glFocus) {
          glFocus.preventDefault();
        const glTarget = document.getElementById(`gl-row${gl.glNumber}`);
          glTarget.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
      });
    });

    } else if (bookmarkBox.querySelector(`.glMark${gl.glNumber}`)) {
      const updateBookmark = document.querySelector(`.glMark${gl.glNumber}`);
      updateBookmark.innerHTML = `<a>GL Number: <strong>${(gl.glNumber)}</strong> - GL Total: <strong>${gl.glAfterTax}</strong></a>`;
    }

    glRow.appendChild(glNumberCell);
    glRow.appendChild(glSubtotalCell);
    glRow.appendChild(glTaxCell);
    glRow.appendChild(glTotalCell);
    glDivider.appendChild(glRow);
    glDivider.appendChild(itemBox);

    glTable.appendChild(glDivider);

    },);

  const itemList = list;

  itemList.forEach((item) => {

    const targetItemBox = document.querySelector(`div[data-glItemBox='${item.itemGL}']`);

    const listItem = document.createElement("tr");
      listItem.style.cssText = "margin-bottom: 5px; display: flex;";
      listItem.classList.add(`${item.itemGL}`);

      const listItemGL = document.createElement("td");
        listItemGL.innerText = `Item GL: ${item.itemGL}`;
        listItemGL.style.cssText = "";

      const listItemCost = document.createElement("td");
        listItemCost.innerText = `Item Cost: ${item.itemCost}`;
        listItemCost.style.cssText = ";";

      const listItemName = document.createElement("td");
        listItemName.innerText = `Item Name: ${item.itemName}`;
        listItemName.style.cssText = "";

      const listItemId = document.createElement("td");
        listItemId.innerText = `Item ID: ${item.itemId}`;
        listItemId.style.cssText = "";

      const listItemX = document.createElement("td");
        listItemX.style.cssText = "flex-grow: -1;";
        listItemX.classList.add(`xBtnContainer`);

      const xBtn = document.createElement("button");
        xBtn.id = `xBtn-${item.btnId}}`
        xBtn.setAttribute("tabindex", "-1")
        xBtn.classList.add(`delBtn`);
        xBtn.dataset.targetBtn = `${item.btnId}`;
        xBtn.innerText = "x"

    listItemX.appendChild(xBtn);
    listItem.appendChild(listItemGL);
    listItem.appendChild(listItemCost);
    listItem.appendChild(listItemName);
    listItem.appendChild(listItemId);
    listItem.appendChild(listItemX);
    
    targetItemBox.appendChild(listItem);
  },);

  const delBtns = document.querySelectorAll('.delBtn');
    delBtns.forEach(button => {
      button.addEventListener('click', removeTarget);
      button.addEventListener('click', function (event) {
        newItem.removeItem(event)
      });
    });

  function removeTarget() {
    this.closest('tr').remove();
  };
  const costFocus = document.getElementById('inputCost');
      costFocus.addEventListener('focus', function() {
      this.select();
  });

  costFocus.blur();

  costFocus.focus();
};

function renderList() {

  const clearBookmarks = document.querySelector('#marksExtra');
    clearBookmarks.innerHTML = "";

  const clearGlTable = document.querySelector('#gl-table');
    clearGlTable.innerHTML = "";

  function getUpdatedList() {
    return newList;
  }

  const updateList = getUpdatedList();

  list.splice(0, list.length);

  itemIdNum = 1;

  updateList.forEach(item => {

    const newItem = {
      itemGL: item.itemGL,
      itemName: item.itemName,
      itemCost: item.itemCost,
      itemId: itemIdNum,
      btnId: getBtnId(),
      removeItem: item.removeItem,
    } 
    
    list.push(newItem);
    itemIdNum++;
    addNewGl(newItem);
  })
};

document.addEventListener("keydown", function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    addNewGl();
  }
}) 

const searchValue = document.getElementById('inputSearch');

function searchList() {

  const results = document.querySelector('.resultsContainer');
        results.innerText = "";

  list.forEach(item => {

    if (item.itemCost !== Number(searchValue.value).toFixed(2)) {

      const results = document.querySelector('.resultsContainer');
        results.innerText = "No matches";

    } else if (searchValue.value == "") {

      const results = document.querySelector('.resultsContainer');
        results.innerText = "Search Results";

    } else if (item.itemCost === Number(searchValue.value).toFixed(2)) {
        
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

    } 
  })

}

let searchBtn = document.querySelector('.searchBtn');
      
searchBtn.addEventListener('click', searchList);





