let list = []
let itemIdNum = 1

let addNewGl = function() {

  const total = document.getElementById("inputTotal").value;
  
      const item = {
        itemGL: document.getElementById("inputGl").value,
        itemName: document.getElementById("inputName").value,
        itemCost: Number(document.getElementById("inputCost").value),
        itemId: itemIdNum
    };
    list.push(item);
        itemIdNum++;    
    
     let sortedGL = list.reduce((GL , item) => {
      if (!GL[item.itemGL]) {
        GL[item.itemGL] = [];
    }
        GL[item.itemGL].push(item);
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
    
    const addButton = document.getElementById("add-item-button").addEventListener("click", addNewGl);
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
    glRow.setAttribute("id", "gl-row");
    glRow.style.cssText = "width: 100%; display: flex;";
    
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
      itemBox.style.cssText = "display: flex; flex-direction: column; width: 100%; height: 225px; background-color: white; padding: 10px; border: outset; boder-color: #5ebfff; overflow: auto; "

    
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
      listItem.style.cssText = "";

      const listItemGL = document.createElement("td");
        listItemGL.innerText = `Item GL: ${item.itemGL}`;
        listItemGL.style.cssText = "";

      const listItemName = document.createElement("td");
        listItemName.innerText = `Item Name: ${item.itemName}`;
        listItemName.style.cssText = "";

      const listItemCost = document.createElement("td");
        listItemCost.innerText = `Item Cost: ${item.itemCost}`;
        listItemCost.style.cssText = "";

      const listItemId = document.createElement("td");
        listItemId.innerText = `Item ID: ${item.itemId}`;
        listItemId.style.cssText = "";

      const listItemX = document.createElement("td");
        listItemX.innerHTML = "<button id='xBtn'>X</button>";
        listItemX.style.cssText = "";

    listItem.appendChild(listItemGL);
    listItem.appendChild(listItemName);
    listItem.appendChild(listItemCost);
    listItem.appendChild(listItemId);
    listItem.appendChild(listItemX);
    
    targetItemBox.appendChild(listItem);
  },)

  };
