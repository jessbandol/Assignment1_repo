import { itemData } from "./products.js";

// extract quantity values from the URL and assign to the quantity array based on the item indexes in the quantityIndex of the itemData array
const params = new URL(document.location).searchParams;
let quantity = [];

for (let i = 0; i < itemData.length; i++) {
    let quantityValue = params.get(`quantity${i}`);
    if (quantityValue !== null) {
        quantity[itemData[i].quantityIndex] = Number(quantityValue);
    }
}

// Inventory object with initial quantities
const inventory = {
    "puffy pinks": 50,
    "sun gold": 50,
    "candyfloss": 50,
    "bubbles": 50,
    "lucky stars": 50,
};

//extended price
let subtotal=0;
let taxRate = 0.0575;
let taxAmount = 0;
let total = 0;
let shippingCharge = 0;

generateItemRows();

if (subtotal <= 50) {
    shippingCharge = 2;
} else if (subtotal <= 100) {
    shippingCharge = 5;
} else {
    shippingCharge = subtotal *0.05;
}

//total calculation
taxAmount = subtotal*taxRate;
total = subtotal + taxAmount + shippingCharge;

//bold total
document.getElementById('total_cell').innerHTML = `$${total.toFixed(2)}`;

//set cells
document.getElementById('subtotal_cell').innerHTML = '$' + subtotal.toFixed(2);
document.getElementById('tax_cell').innerHTML = '$' + taxAmount.toFixed(2);
document.getElementById('shipping_cell').innerHTML = '$' + shippingCharge.toFixed(2);


//validate quantity inputted into the textbox 
function validateQuantity(brand, quantity) {
    const availableInventory = inventory[brand];

    if (isNaN(quantity)) {
        // Display error message in bold and red
        return `<span style="color: red; font-weight: bold;">Not a number</span>`;
    } else if (quantity < 0) {
        // Display error message in bold and red
        return `<span style="color: red; font-weight: bold;">Negative quantity</span>`;
    } else if (!Number.isInteger(quantity)) {
        // Display error message in bold and red
        return `<span style="color: red; font-weight: bold;">Not an Integer</span>`;
    } else if (quantity > availableInventory) {
        // Display error message in bold and red
        return `<span style="color: red; font-weight: bold;">Only ${availableInventory} ${brand} available</span>`;
    } else {
        // Update inventory for valid quantity
        inventory[brand] -= quantity;
        return "";
    }
}

// Item rows (generate the entire invoice table)
function generateItemRows() {
    let table = document.getElementById('invoiceTable');
    table.innerHTML = '';
    let hasErrors = false;
    for (let i = 0; i < itemData.length; i++) {
        let item = itemData[i];
        let itemQuantity = quantity[item.quantityIndex];
        let validationMessage = validateQuantity(item.brand, itemQuantity);

        if (validationMessage !== "") {
            hasErrors = true;
            let row = table.insertRow();
            row.insertCell(0).innerHTML = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 22px;">${item.brand}</span>`;
            row.insertCell(1).innerHTML = validationMessage;
        } else if (itemQuantity > 0) {
            let extendedPrice = item.price * itemQuantity;
            subtotal += extendedPrice;

            let row = table.insertRow();
            row.insertCell(0).innerHTML = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 22px;">${item.brand}</span>`;
            row.insertCell(1).innerHTML = itemQuantity;
            row.insertCell(2).innerHTML = '$' + item.price.toFixed(2);
            row.insertCell(3).innerHTML = '$' + extendedPrice.toFixed(2);
        }
    }
    if (!hasErrors) {
        document.getElementById('total_cell').innerHTML = '$' + total.toFixed(2);
    }
}