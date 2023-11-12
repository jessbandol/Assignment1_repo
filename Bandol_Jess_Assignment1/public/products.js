//array with various numeric and string values
//let quantity = [0, "cat", 1.5, -1.5, 0];
let quantity = [0, 0, 0, 0, 0];

//define array itemData and export to the invoice page
let itemData = [
    {
        brand:'puffy pinks',
        price: 5.20,
        quantityIndex: 0,
    },
    {
        brand: 'sun gold',
        price: 5.20,
        quantityIndex: 1,
    },
    {
        brand: 'candyfloss',
        price: 6.10,
        quantityIndex: 2,
    },
    {
        brand: 'bubbles',
        price: 4.15,
        quantityIndex: 3,
    },
    {
        brand: 'lucky stars',
        price: 6.10,
        quantityIndex: 4,
    },
];

export {itemData,quantity};

/*
const product1 = {
    brand: "puffy pinks",
    price: 5.20,
    image: "./images/Puffy Pinks.jpeg",
    quantityIndex: 0
};

const product2 = {
    brand: "sun gold",
    price: 5.20,
    image: "./images/Sun Gold.png",
    quantityIndex: 1
};

const product3 = {
    brand: "candyfloss",
    price: 6.10,
    image: "./images/Candyfloss.png",
    quantityIndex: 2
};

const product4 = {
    brand: "bubbles",
    price: 4.15,
    image: "./images/Bubbles.png",
    quantityIndex: 3
};

const product5 = {
    brand: "lucky stars",
    price: 6.10,
    image: "./images/Lucky Stars.png",
    quantityIndex: 4
};

//POKE9 array
const products = [product1, product2, product3, product4, product5];

//for loop
for (let i=0; i < products.length; i++) {
    const product = products[i];
    document.querySelector('.main').innerHTML += `
    <section class="item">
        <h2>${product.brand}</h2>
        <p>$${product.price}</p>
        <img src="${product.image}" onmouseover="changeClassName(this);" onclick="resetClassName(this);" />
        <label id="quantity${i}_label" for="quantity${i}">Quantity Desired</label>
        <input type="text" name="quantity${i}" id="quantity${i}">
    </section>`;
}
*/