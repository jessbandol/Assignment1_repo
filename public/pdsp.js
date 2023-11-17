function submitForm() {
    // Perform any necessary tasks before submitting the form
    console.log("Form submitted!");
    // Submit the form
    document.getElementById('purchaseForm').submit();
}

//define objects representing a product with brand, price, and image information
const product1 = {
    brand: "puffy pinks",
    price: 5.20,
    image: "./images/Puffy Pinks.jpeg"
    //quantityIndex: 0
};

const product2 = {
    brand: "sun gold",
    price: 5.20,
    image: "./images/Sun Gold.png"
    //quantityIndex: 1
};

const product3 = {
    brand: "candyfloss",
    price: 6.10,
    image: "./images/Candyfloss.png"
    //quantityIndex: 2
};

const product4 = {
    brand: "bubbles",
    price: 4.15,
    image: "./images/Bubbles.png"
    //quantityIndex: 3
};

const product5 = {
    brand: "lucky stars",
    price: 6.10,
    image: "./images/Lucky Stars.png"
    //quantityIndex: 4
};

//POKE9 array
const products = [product1, product2, product3, product4, product5];

/* original for loop
for (let i=0; i < products.length; i++) {
    const product = products[i];
    document.querySelector('.main').innerHTML += `
    <section class="item">
        <h2>${product.brand}</h2>
        <p>$${product.price}</p>
        <img src="${product.image}"/>
        <label id="quantity${i}_label" for="quantity${i}"> Quantity Desired </label>
        <input type="text" name="quantity${i}" id="quantity${i}">
    </section>`;
}
*/

// for loop (generates product sections with quantity input and error messages for each product in the array)
for (let i = 0; i < products.length; i++) {
    document.querySelector('.main').innerHTML += `
    <section class="item">
        <h2>${products[i].brand}</h2>
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