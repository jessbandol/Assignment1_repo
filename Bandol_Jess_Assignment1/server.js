const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

// Import data from a JSON file containing information about products
const products = require(__dirname + "/products.json");

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Define a route for handling a GET request to a path that matches "/products.js"
app.get('/products.js', function (request, response, next) {
    // Send the response as JavaScript
    response.type('.js');

    // Create a JavaScript string (products_str) that contains data loaded from the products.json file
    const products_str = `let products = ${JSON.stringify(products)};`;

    // Send the string in response to the GET request
    response.send(products_str);
});

// Serve static files from the 'public' directory
app.use(express.static(__dirname + '/public'));

// Define a route to serve products data
app.get('/products', (req, res) => {
    // Read the products.json file and send it as a response
    fs.readFile('products.json', (err, data) => {
        if (err) {
            console.error('Error reading products.json:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

// Define a route to display the products page
app.get('/products.html', (req, res) => {
    // Serve your HTML page here
    res.sendFile(__dirname + '/public/products.html');
});

// Define a route to validate purchase data
app.post('/validate-purchase', (req, res) => {
    // Your purchase validation logic goes here
    // You can access form data with req.body

    // For example, let's log the received data
    console.log(req.body);

    // Respond with success or error
    res.status(200).send('Purchase Validated');
});

// Define a route to provide an invoice for a purchase
app.post('/invoice.html', (req, res) => {
    // Generate and serve the invoice here
    // You can use a template or dynamically generate the invoice

    // Serve your invoice HTML page
    res.sendFile(__dirname + '/public/invoice.html');
});

// Start the server on port 8080
app.listen(8080, () => console.log('Server is running on port 8080'));