//Importing the Express.js framework
const express = require('express');

//create instance of express application called "app"
//app will define routes, hadnle requests, etc.
const app = express();

//require querystring middleware
//convert javascript into URL query string
const qs = require('querystring');

//monitor all requests and its paths
//send message to server console for monitor and troubleshooting
app.all('*', function(request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});

/* Import data from a JSON file containing information about products
__dirname represents the directory of the current module (where server.js is located)
__dirname + "./products.json" specifies the location of products.json
*/

//route all requests from public directory 
app.use(express.static(__dirname + '/public'));

//start server
app.listen(8080, () => console.log(`listening on port 8080`));

const products = require(__dirname + "/products.json");

// Define a route for handling a GET request to a path that matches "./products.js"
app.get('/products.js', function(request, response, next) {
	// Send the response as JS
	response.type('.js');
	
	// Create a JS string (products_str) that contains data loaded from the products.json file
	// Convert the JS string into a JSON string and embed it within variable products
	let products_str = `let products = ${JSON.stringify(products)};`;
	
	// Send the string in response to the GET request
	response.send(products_str);
});

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({extended: true}));

for (let i in products) {
    products.forEach((prod, i) => {prod.qty_sold = 0});
}

//respond to a post method to path /process_purchase
// Define a route to handle form processing
app.post("/process_purchase", function(request, response) {
    // Initialize variables
    console.log('Processing purchase...');
    let POST = request.body;
    let has_qty = false;
    let errObject = {};

    // Iterate through products
    for (let i in products) {
        let qty = POST[`qty${[i]}`];
        has_qty = has_qty || (qty > 0);

        //validate using updated validateQuantity function
        let errorMessages = validateQuantity(qty, products[i].qty_available);

        //store error messages if there are any
        if (errorMessages.length > 0) {
            errObject[`qty${[i]}_error`] = errorMessages.join(', ');
        }
    }
    
//if all input boxes are empty and there are no errors
if (has_qty == false && Object.keys(errObject).length == 0) {
    //redirect to products page with an error parameter in url
    response.redirect("./products_display.html?error");
    }
    //if there is an input and no errors
    else if (has_qty == true && Object.keys(errObject).length == 0) {
    //update product quantities and redirect to invoice page
    for (let i in products) {
        let qty = POST[`qty${[i]}`];

            //update quantity sold and what is available
            products[i].qty_sold += Number(qty);
            products[i].qty_available = products[i].qty_available - qty;
        }
    //redirect to invoice page with valid data in URL
    console.log('Redirecting to /invoice.html');
    // Change from using errorObject to errObject
    response.redirect("./invoice.html?valid&" + qs.stringify(POST));
    }
    //if there is an input error (aside from no inputs)
else if (Object.keys(errObject).length > 0) {
    //redirect to products page with input error messages in URL
    response.redirect("./invoice.html?valid&" + qs.stringify(POST) + `&inputErr`);
}

});

//function to validate quantity entered against variable quantity 
function validateQuantity(quantity, availableQuantity) {
    let errors = []; //initialize array to hold error messages
    quantity = Number(quantity); //convert qty to number

    switch(true) {
        case isNaN(quantity) || quantity ==='':
            errors.push("Not a number. Please enter a non-negative quantity to order.")
            break;
        case quantity < 0 && !Number.isInteger(quantity):
            errors.push("Negative inventory and not an Integer. Please enter a non-negative quantity to order.")
            break;
        case quantity < 0:
            errors.push("Negative inventory. Please enter a non-negative quantity to order.")
            break;
        case quantity != 0 && !Number.isInteger(quantity):
            errors.push("Not an Integer. Please enter a non-negtaiv quantity to order.")
            break;
        case quantity > availableQuantity:
            errors.push(`We do not have ${quantity} available.`);
    }
    return errors; //return array of errors
}