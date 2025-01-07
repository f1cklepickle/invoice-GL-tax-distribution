let list = []
let itemIdNum = 1
let newList = []

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
  
      const newItem = item || {
        itemGL: document.getElementById("inputGl").value || "Blank",
        itemName: document.getElementById("inputName").value,
        itemCost: Number(document.getElementById("inputCost").value || 0),
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

        
    if (newItem.itemGL === "Blank") {
      alert("Please enter GL number");
      return;
    }

    if(!item) {
    list.push(newItem);
        itemIdNum++;    
    }
    
     let sortedGL = list.reduce((GL , newItem) => {
      if (!GL[newItem.itemGL]) {
        GL[newItem.itemGL] = [];
    } 
        GL[newItem.itemGL].push(newItem);
        return GL;
    }, {});
    
    let totalCostByGL = Object.keys(sortedGL).map(GL => {
      const totalCost = sortedGL[GL].reduce((sum, item) => {
        return sum + Number(item.itemCost || 0)
    }, 0);  
          return {
            glNumber: GL,
            totalCost: totalCost.toFixed(2)
    };
    });
    
    let getSubTotal = function() {
      return totalCostByGL.reduce((sum, obj) => {
        return sum + Number(obj.totalCost || 0);
    }, 0);
    };
    
    const getTax = function() {
    let subTotal = getSubTotal();
    return Number(total) - subTotal;
    };
    
    const addTax = function() {
      const subTotal = getSubTotal();
      const tax = getTax();
        if (subTotal === 0)
          return [];
    
      return totalCostByGL.map((gl) => {
      const glTotal = Number(gl.totalCost)
    const glPercentage = ((glTotal / subTotal) * 100).toFixed(2);
    const glTax = ((glPercentage * (tax / 100)).toFixed(2));
    const glAfterTax = Number((glTotal) + Number(glTax)).toFixed(2);
      return {
        glNumber: gl.glNumber,
        glTotal: glTotal.toFixed(2),
        glPercentage,
        glTax,
        glAfterTax,
          };
        });

      };
        
    console.log("Sorted GL:");
    console.log(sortedGL);
    console.log("Total Cost by GL:");
    console.log(totalCostByGL);
    console.log(`Subtotal: ${getSubTotal().toFixed(2)}`);
    console.log("Invoice Total:" , total);
    console.log(`Tax: ${getTax().toFixed(2)}`);
    console.log(`GL after tax:`, addTax())
    
    document.addEventListener("DOMContentLoaded", () => {
    
    const addButton = document.querySelector('#add-item-button');
      addButton.addEventListener("click", addNewGl);

    },);
   
    const subTotal = getSubTotal();

    document.getElementById("invoice-total").innerText = Number(total).toFixed(2);
    document.getElementById("subtotal").innerText = subTotal.toFixed(2);
    document.getElementById("tax").innerText = getTax().toFixed(2);


    const glTable = document.querySelector("#gl-table");
      glTable.style.cssText = "width: 100%;"
      glTable.innerHTML = "";

    const glDetails = addTax();
    
    glDetails.forEach((gl) => {

    const glRow = document.createElement("tr");
      glRow.setAttribute("id", `gl-row${gl.glNumber}`);
      glRow.style.cssText = "display: flex;";
    
    const glNumberCell = document.createElement("th");
      glNumberCell.innerText = `GL Number: ${gl.glNumber}`;
      glNumberCell.style.cssText = "flex-grow: 1;";

    const glSubtotalCell = document.createElement("th");
      glSubtotalCell.innerText = `GL Subtotal: ${gl.glTotal}`;
      glSubtotalCell.style.cssText = "flex-grow: 1;";

    const glTotalCell = document.createElement("th");
      glTotalCell.innerText = `GL Total: ${gl.glAfterTax}`;
      glTotalCell.style.cssText = "flex-grow: 1;";

    const glTaxCell = document.createElement("th");
      glTaxCell.innerText = `GL Tax: ${gl.glTax}`;
      glTaxCell.style.cssText = "flex-grow: 1;";

    const glDivider = document.createElement("div");
      glDivider.setAttribute("data-glNumber", `${gl.glNumber}`);
      glDivider.setAttribute("id", "glDivider");

    const itemBox = document.createElement("div");
      itemBox.setAttribute("data-glItemBox", `${gl.glNumber}`)
      itemBox.style.cssText = "display: flex; flex-direction: column; max-width: 100%; height: 225px; background-color: white; padding: 10px; border: outset; boder-color: #5ebfff; overflow: auto; "

    const bookmarkBox = document.querySelector("#marksExtra");

    if(!bookmarkBox.querySelector(`.glMark${gl.glNumber}`)){

    const glBookmark = document.createElement("li");
      glBookmark.innerHTML = `<a><strong>GL Number:</strong> ${(gl.glNumber)} - <strong>GL Total:</strong> ${gl.glAfterTax}</a>`;
      glBookmark.classList.add(`glMark${gl.glNumber}`);
      glBookmark.setAttribute("tabindex", "-1");
      glBookmark.setAttribute("id", "linkSelector")
      glBookmark.setAttribute("href", `#glMark${gl.glNumber}`)
      glBookmark.style.cssText = "background-color: #f4f4f4; padding: 5px; max-height: 40px; margin: 0px 5px 3px 5px; min-width: 90%; text-decoration: none; color: inherit;";

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
      updateBookmark = document.querySelector(`.glMark${gl.glNumber}`)
      updateBookmark.innerHTML = `<a><strong>GL Number:</strong> ${(gl.glNumber)} - <strong>GL Total:</strong> ${gl.glAfterTax}</a>`;
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
        listItemGL.style.cssText = "flex-grow: 4;";

      const listItemName = document.createElement("td");
        listItemName.innerText = `Item Name: ${item.itemName}`;
        listItemName.style.cssText = "flex-grow: 4;";

      const listItemCost = document.createElement("td");
        listItemCost.innerText = `Item Cost: ${item.itemCost}`;
        listItemCost.style.cssText = "flex-grow: 4;";

      const listItemId = document.createElement("td");
        listItemId.innerText = `Item ID: ${item.itemId}`;
        listItemId.style.cssText = "flex-grow: 4;";

      const listItemX = document.createElement("td");
        listItemX.style.cssText = "flex-grow: -1;";

      const xBtn = document.createElement("button");
        xBtn.id = `xBtn-${item.btnId}}`
        xBtn.setAttribute("tabindex", "-1")
        xBtn.classList.add(`delBtn`);
        xBtn.dataset.targetBtn = `${item.btnId}`;
        xBtn.innerText = "x"

    listItemX.appendChild(xBtn);
    listItem.appendChild(listItemGL);
    listItem.appendChild(listItemName);
    listItem.appendChild(listItemCost);
    listItem.appendChild(listItemId);
    listItem.appendChild(listItemX);
    
    targetItemBox.appendChild(listItem);
  },);

  const delBtns = document.querySelectorAll('.delBtn');
  console.log(delBtns)
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




