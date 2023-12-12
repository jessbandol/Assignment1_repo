//set up params from header, order array, and error value
let params = (new URL(document.location)).searchParams;
//let error;
//let order = [];

//get if there was an error before
//error = params.get('error');
//gets params from url
//let username = params.get('username');
//let totalOnline = params.get('totalOnline');
//let thankYouMessage = params.get('thankYou');

//define objects representing a product with brand, price, and image information
const product1 = {
    brand: "puffy pinks",
    price: 5.20,
    image: "./images/Puffy Pinks.jpeg",
    quantity_available: 100,
};

const product2 = {
    brand: "sun gold",
    price: 5.20,
    image: "./images/Sun Gold.png",
    quantity_available: 100
};

const product3 = {
    brand: "candyfloss",
    price: 6.10,
    image: "./images/Candyfloss.png",
    quantity_available: 100
};

const product4 = {
    brand: "bubbles",
    price: 4.15,
    image: "./images/Bubbles.png",
    quantity_available: 100
};

const product5 = {
    brand: "lucky stars",
    price: 6.10,
    image: "./images/Lucky Stars.png",
    quantity_available: 100
};

//POKE9 array
const products = [product1, product2, product3, product4, product5];

//extended price
let subtotal = 0;
let taxRate = 0.0575;
let taxAmount = 0;
let total = 0;
let shippingCharge = 0;

// for loop (generates product sections with quantity input and error messages for each product in the array)
for (let i = 0; i < products.length; i++) {
    document.querySelector('.main').innerHTML += `
    <section class="item">
        <h2>${products[i].brand}</h2>
        <p>In Stock: <span style="text-decoration: underline; color: orange; display: inline-block; margin-bottom: 15px">${products[i].quantity_available}</span></p>
        <p>Sold: <span style="text-decoration: underline; color: orange; display: inline-block; margin-bottom: 15px">${products[i].total_sold}</span></p>
        <p>$${products[i].price.toFixed(2)}</p>
        <img src="${products[i].image}"/>
        
        <div class="quantity-selector">
        <button type="button" class="qtyButton highlight" onclick="document.getElementById('qty${[i]}_entered').value--; checkInputTextbox(document.getElementById('qty${[i]}_entered'), ${products[i].qty_available});">-</button>
        <input type="text" autocomplete="off" placeholder="0" name="qty${[i]}" id="qty${[i]}_entered" class="inputBox" onkeyup="checkInputTextbox(this,${products[i].qty_available})">
        <button type="button" class="qtyButton highlight" onclick="document.getElementById('qty${[i]}_entered').value++; checkInputTextbox(document.getElementById('qty${[i]}_entered'), ${products[i].qty_available});">+</button>
        </div>

        <div id="qty${[i]}_error" style="color: red;"></div>
    </section>`;
}

/*
//validation errors
function validateQuantity(index) {
    const quantityInput = document.getElementById(`quantity${index}`);
    const errorMessage = document.getElementById(`quantity${index}_error`);

    const quantityValue = quantityInput.value.trim();
    if (isNaN(quantityValue) || quantityValue < 0 || !Number.isInteger(Number(quantityValue))) {
        // Invalid quantity
        quantityInput.style.borderColor = 'red';
        errorMessage.textContent = 'Quantity must be a non-negative integer!';
        errorMessage.classList.remove('valid-message');
        errorMessage.classList.add('error-message');
    } else {
        // Valid quantity
        quantityInput.style.borderColor = ''; // Reset border color
        errorMessage.textContent = ''; // Reset error message
        errorMessage.classList.remove('error-message');
        errorMessage.classList.add('valid-message');
    }
}
*/

window.onload = function() {
    if (params.has('error')) {

        document.getElementById('errMsg').innerHTML = "No quantities selected.";
        setTimeout(() => {
            document.getElementById('errMsg').innerHTML = "";
        }, 2000);
    }
    else if (params.has('inputErr')) {
        document.getElementById('errMsg').innerHTML = "Please fix errors before proceeding.";
        setTimeout(() => {
            document.getElementById('errMsg').innerHTML = "";
        }, 2000);
        
        for (let i in products) {
            let qtyInput = qty_form[`qty${[i]}_entered`];
            let qtyError = document.getElementById(`qty${[i]}_error`);

            //set value from url parameters
            if (params.get(`qty${i}`) !== null) {
                qtyInput.value = params.get(`qty${i}`);
            }

            //validate quantity & display errors 
            let errorMessages = validateQuantity(qtyInput.value, products[i].qty_available);
            if (errorMessages.length > 0) {
                qtyError.innerHTML = errorMessages.join('<br>');
                qtyInput.parentElement.style.borderColor = "red";
            } else {
                qtyError.innerHTML = "";
                qtyInput.parentElement.style.borderColor = "black";
            }
        }
    }
    if (params.has('name')) {
        document.getElementById('WelcomeMsg').innerHTML = `Thank you ${name}! You are the most charming!`;
        for (let i in products) {
            qty_form[`qty${i}`].value = params.get(`qty${i}`);
        }
    }
}

//validation errors
function validateQuantity(quantity, availableQuantity) {
    let errors = []; // Initialize an array to hold error messages

    quantity=Number(quantity);

    switch (true) {
        case (isNaN(quantity)) && (quantity != ''):
            errors.push("Not a number. Please enter a non-negative quantity to order.");
            break;
        case quantity < 0 && !Number.isInteger(quantity):
            errors.push("Negative inventory and not an Integer. Please enter a non-negative quantity to order.");
            break;
        case quantity < 0:
            errors.push("Negative inventory. Please enter a non-negative quantity to order.");
            break;
        case quantity !=0 && !Number.isInteger(quantity):
            errors.push("Not an Integer. Please enter a non-negative quantity to order.");
            break;
        case quantity > availableQuantity:
            errors.push(`We do not have ${quantity} available.`);
            break;
        
    }

    return errors; 
};

//quantity textbox check
function checkInputTextbox(textBox, availableQuantity) {
    let str = String(textBox.value);

    // Check if the first character is '0' and remove it if found
    if (str.charAt(0) == '0') {
        textBox.value = Number(str.slice(0, 0) + str.slice(1, str.length));
    }

    // Convert the input value to a number
    let inputValue = Number(textBox.value);

    // Validate the user input quantity using the updated validateQuantity function
    let errorMessages = validateQuantity(inputValue, availableQuantity);

    // Check if there are any error messages and update the display
    let errorDisplay = document.getElementById(textBox.name + '_error');
    if (errorMessages.length > 0) {
        errorDisplay.innerHTML = errorMessages.join('<br>');
        errorDisplay.style.color = "red";
        textBox.parentElement.style.borderColor = "red";
    } else {
        errorDisplay.innerHTML = "";
        textBox.parentElement.style.borderColor = "black";
    }
}

/*
// for loop (generates product sections with quantity input and error messages for each product in the array)
for (let i = 0; i < products.length; i++) {
    document.querySelector('.main').innerHTML += `
    <section class="item">
        <h2>${products[i].brand}</h2>
        <p>In Stock: <span style="text-decoration: underline; color: orange; display: inline-block; margin-bottom: 15px">${products[i].quantity_available}</span></p>
        <p>Sold: <span style="text-decoration: underline; color: orange; display: inline-block; margin-bottom: 15px">${products[i].total_sold}</span></p>
        <p>$${products[i].price.toFixed(2)}</p>
        <img src="${products[i].image}"/>
        <label id="quantity${i}_label" for="quantity${i}"> Quantity Desired </label>
        <input type="text" name="quantity${i}" id="quantity${i}" oninput="validateQuantity(${i})">
        <p class="error-message" id="quantity${i}_error"></p>
    </section>`;
}

// Validation function
function validateQuantity(index) {
    const quantityInput = document.getElementById(`quantity${index}`);
    const errorMessage = document.getElementById(`quantity${index}_error`);

    const quantityValue = quantityInput.value.trim();
    if (isNaN(quantityValue) || quantityValue < 0 || !Number.isInteger(Number(quantityValue))) {
        // Invalid quantity
        quantityInput.style.borderColor = 'red';
        quantityInput.style.borderWidth = '4px'; // Set border width to 4 pixels (or adjust as needed)
        errorMessage.textContent = 'Quantity must be a non-negative integer!';
        errorMessage.classList.remove('valid-message');
        errorMessage.classList.add('error-message');
    } else {
        // Valid quantity
        quantityInput.style.borderColor = ''; // Reset border color
        quantityInput.style.borderWidth = ''; // Reset border width
        errorMessage.textContent = `You want: ${quantityValue} items!`; // Display the desired message
        errorMessage.classList.remove('error-message');
        errorMessage.classList.add('valid-message');
    }
}

//going to login after purchase
document.addEventListener('DOMContentLoaded', function() {
    const qtyForm = document.forms['qty_form'];

    // Retrieve purchase information from local storage
    const purchaseFormData = JSON.parse(localStorage.getItem('purchaseFormData'));

    // Add an event listener for form submission
    qtyForm.addEventListener('submit', function (event) {
    event.preventDefault();

    // Serialize form data and store it in local storage
    const formData = new FormData(qtyForm);
    const serializedData = {};

    // Filter out undefined and empty values
    for (const [key, value] of formData.entries()) {
        if (value !== undefined && value.trim() !== '') {
            serializedData[key] = value.trim();
        }
    }

     // Store the serialized data in local storage
     localStorage.setItem('selectedQuantities', JSON.stringify(serializedData));

     // Redirect to the login page
     window.location.href = 'login.html';
 });

    // Check if there is purchase information and populate the form
    if (purchaseFormData) {
        for (const [key, value] of Object.entries(purchaseFormData)) {
            const inputField = document.getElementById(key);
            if (inputField) {
                inputField.value = value;
            }
        }
    }

    // Add this line after redirecting to the login page
    localStorage.removeItem('purchaseFormData');
});
*/