let list = []
let itemIdNum = 1

const total = Number(prompt("Enter invoice total.")).toFixed(2);

let addNewGl = function() {
      const item = {
        itemGL: prompt(`Item GL`),
        itemName: prompt(`Item Name`),
        itemCost: Number(prompt(`Item Cost`)),
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
    
    const glTableBody = document.querySelector("#gl-table tbody");
    glTableBody.innerHTML = "";
    const glDetails = addTax();
    
    glDetails.forEach((gl) => {
      const row = document.createElement("tr");
    
    const glNumberCell = document.createElement("td");
    glNumberCell.innerText = gl.glNumber;
    
    const glSubtotalCell = document.createElement("td");
      glSubtotalCell.innerText = gl.glTotal;
    
    const glTotalCell = document.createElement("td");
    glTotalCell.innerText = gl.glAfterTax;
    
    const glTaxCell = document.createElement("td");
    glTaxCell.innerText = gl.glTax;
    
    row.appendChild(glNumberCell);
    row.appendChild(glSubtotalCell);
    row.appendChild(glTaxCell);
    row.appendChild(glTotalCell);
    
    glTableBody.appendChild(row);
    },);
    };