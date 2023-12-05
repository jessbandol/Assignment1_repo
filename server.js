const fs = require('fs');
const express = require('express');
const app = express();
const path = require('path');
const qs = require('querystring');

// File paths
const filename = __dirname + '/user_data.json';
const userDataPath = path.join(__dirname, 'user_data.json');

// Read and parse user data
let user_reg_data;

if (fs.existsSync(filename)) {
    let data = fs.readFileSync(filename, 'utf-8');
    user_reg_data = JSON.parse(data);
    let user_data_stats = fs.statSync(filename);
    let stats_size = user_data_stats.size;

    console.log(`The filename ${filename} has ${stats_size} characters`);
} else {
    console.log(`The file name ${filename} does not exist.`);
}

// Middleware to log all requests
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(__dirname + '/public'));

// Load product data
const products = require(__dirname + "/products.json");

// Declare selectedQuantities outside of any route handler
let selectedQuantities = [];
let POST = {};

// Route for handling a GET request to "./products.js"
app.get('/products.js', function (request, response, next) {
    response.type('.js');
    let products_str = `let products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

// Route to get dummy user data
app.get('/api/user-data', function (request, response) {
    const userData = { username: 'testuser', email: 'testuser@example.com' };
    response.json(userData);
});

// Initialize product quantities
for (let i in products) {
    products[i].qty_sold = 0; // Adding qty_sold=0 to each product
}

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Load user data
let userData = loadUserData();
console.log('User data:', userData);

/*
//registering new user
app.post('/register', (request, response) => {
    const { username, email, password, 'psw-repeat': confirmPassword } = request.body;

    // Check if the username is already in use
    if (userExists(username)) {
        const usernameError = `${username} is already in use. Please pick a different username.`;
        return response.status(400).json({ error: usernameError });
    }

    // Check if the email is already in use
    if (emailExists(email)) {
        const emailError = `${email} is already in use. Please pick a different email.`;
        return response.status(400).json({ error: emailError });
    }

    // Validate password match
    if (password !== confirmPassword) {
        const passwordError = 'Passwords do not match';
        return response.status(400).json({ error: passwordError });
    }

    // Save user data
    const newUser = { username, email, password };
    userData.push(newUser);
    saveUserData();

    // Construct query string
    const queryString = `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}`;

    // Redirect to invoice.html upon successful registration
    response.json({ success: true, redirect: `/invoice.html?${queryString}` });
});


function userExists(username) {
    return userData.some(u => u.username === username);
}

function emailExists(email) {
    return userData.some(u => u.email === email);
}

//logging in users
app.post("/login", function (request, response) {
    const { username, password } = request.body;
    console.log('Received login request:', username, password);

    // Find the user in the user data
    const user = userData.find(u => u.username === username);

    if (user) {
        console.log('User found. Comparing passwords...');
        console.log('Stored password:', user.password);
        console.log('Entered password:', password);
    
        if (password === user.password) {
            // Redirect to the invoice page upon successful login with query parameters
            const params = new URLSearchParams({
                username: user.username,
                // Add any other parameters you want to include
            });

            response.redirect(`/invoice.html?${params.toString()}`);
        } else {
            console.log('Password incorrect.');
            response.json({ success: false, error: 'Username or password not found.' });
        }
    } else {
        console.log('User not found.');
        response.json({ success: false, error: 'Username or password not found.' });
    }
});
*/

app.post("/process_purchase", function (request, response) {
    // Initialize variables
    console.log('Processing purchase...');
    POST = request.body; // Define POST within the scope of this route
    let has_qty = false;
    let errObject = {};

    // Initialize an array to store quantities
    selectedQuantities = [];

    // Iterate through products
    for (let i in products) {
        let qty = POST[`quantity${[i]}`];
        has_qty = has_qty || (qty > 0);

        // Validate using the updated validateQuantity function
        let errorMessages = validateQuantity(qty, products[i].quantity_available);

        // Store error messages if there are any
        if (errorMessages.length > 0) {
            errObject[`quantity${[i]}_error`] = errorMessages.join(', ');
        }

        // Add the selected quantity to the array
        selectedQuantities.push(qty);
    }

    // If all input boxes are empty and there are no errors
    if (has_qty === false && Object.keys(errObject).length === 0) {
        // Redirect to login page with an error parameter in the URL
        response.redirect("./login.html?error");
    } else if (has_qty === true && Object.keys(errObject).length === 0) {
        // Redirect to login page with valid data in the URL
        response.redirect(`./login.html?valid&${qs.stringify(POST)}`);
    } else if (Object.keys(errObject).length === 0) {
        // If no errors, update the available quantity and redirect to invoice.html with "valid" and selected quantities

        // Update product quantities and redirect to invoice page
        for (let i in products) {
            let qty = POST[`quantity${[i]}`];

            // Update quantity available
            products[i].quantity_available = products[i].quantity_available - qty;
        }

        const redirectURL = selectedQuantities.map((quantity, index) => `&quantity${index}=${quantity}`).join('');
        return response.redirect(`/invoice.html?valid${redirectURL}`);
    }
});


// Route for updating qty_sold and available quantities
app.post("/purchase_logout", function (request, response) {
    // Update product quantities and redirect to invoice page
    for (let i in products) {
        let qty = request.body[`qty${[i]}`];

        // Update quantity sold and what is available
        products[i].qty_sold += Number(qty);
        products[i].qty_available = products[i].qty_available - qty;
    }

    // Redirect to invoice page with valid data in the URL
    console.log('Redirecting to /invoice.html');
    response.redirect("./invoice.html?valid&" + qs.stringify(request.body));
});


// Route for processing login
app.post('/process_login', function (request, response) {
    // Read in the form post (request.body)
    const formData = request.body;

    // Read user input from login form
    const email = formData.email.toLowerCase(); // Convert email to lowercase
    const password = formData.psw;

    // Validate that an email and password were entered
    if (!email || !password) {
        return handleLoginError(response, 'Please enter both email and password.', formData);
    }

    // Check to see if the email matches an existing user
    const user = user_reg_data.find(u => u.email === email);

    if (user) {
        // Check if the password matches
        if (password === user.password) {
            // Both email and password are good

            // Update current_user dummy variable for sticky use
            const current_user = {
                email: user.email
                // Add more properties as needed
            };

            // Update selectedQuantities array
            selectedQuantities = Object.values(POST);

            if (Array.isArray(selectedQuantities)) {
                // Redirect to invoice.html with "valid" and selected quantities
                // Construct redirect URL with selected quantities
                const redirectURL = selectedQuantities.map((quantity, index) => `&qty${index}=${quantity}`).join('');
                return response.redirect(`/invoice.html?valid&${redirectURL}`);
            } else {
                // Log an error if selectedQuantities is not an array
                console.error('selectedQuantities is not an array:', selectedQuantities);
                return response.status(500).send('Internal Server Error');
            }
        } else {
            // Password does not match
            return handleLoginError(response, 'Invalid password.', formData);
        }
    } else {
        // Email does not match an existing user
        return handleLoginError(response, 'Invalid email address.', formData);
    }
});

// Function to handle login errors and redirect back to login.html
function handleLoginError(response, errorMessage, formData) {
    // Update login error message
    formData.loginError = errorMessage;

    // Redirect back to login.html with params for login error and sticky email address
    return response.redirect(`/login.html?${qs.stringify(formData)}`);
}

// Handle the 'Continue Shopping' post request
app.post('/continue_shopping', (req, res) => {
    // Redirect to products_display page and let the user select more quantities or products while keeping previously selected quantities
    res.redirect('/products_display.html');
});

// Handle the 'Finish Shopping' post request
app.post('/purchase_logout', (req, res) => {
    // Extract items or quantities selected from the request body
    const selectedItems = req.body.selectedItems; // Replace with the actual field name used in your form
    const selectedQuantities = req.body.selectedQuantities; // Replace with the actual field name used in your form

    // Count items as sold and update quantities in your data or database
    for (let i = 0; i < selectedItems.length; i++) {
        const selectedItem = selectedItems[i];
        const selectedQuantity = selectedQuantities[i];

        updateSoldItems(selectedItem, selectedQuantity);
    }

    // Redirect to the index page with a thank you message
    res.redirect('/index.html?thank_you=true');
});


// Route to get user data for testing
app.get('/get-user-data', function (request, response) {
    // Read user data from the JSON file
    const userData = loadUserData();
    response.json(userData);
});

// Helper function to load user data
function loadUserData() {
    try {
        const data = fs.readFileSync(userDataPath, 'utf8');
        const jsonData = JSON.parse(data);
        const usersArray = Object.values(jsonData);
        return usersArray || [];
    } catch (error) {
        console.error('Error loading user data:', error.message);
        return [];
    }
}

// Helper function to save user data
function saveUserData() {
    try {
        fs.writeFileSync(userDataPath, JSON.stringify(userData, null, 2));
    } catch (error) {
        console.error('Error saving user data:', error.message);
    }
}

// Helper function to check if a username exists
function userExists(username) {
    return userData.some(u => u.username === username);
}

// Function to validate quantity
function validateQuantity(quantity, availableQuantity) {
    let errors = []; // initialize array to hold error messages
    quantity = Number(quantity); // convert qty to a number

    switch (true) {
        case isNaN(quantity) || quantity === '':
            errors.push("Not a number. Please enter a non-negative quantity to order.");
            break;
        case quantity < 0 && !Number.isInteger(quantity):
            errors.push("Negative inventory and not an Integer. Please enter a non-negative quantity to order.");
            break;
        case quantity < 0:
            errors.push("Negative inventory. Please enter a non-negative quantity to order.");
            break;
        case quantity !== 0 && !Number.isInteger(quantity):
            errors.push("Not an Integer. Please enter a non-negative quantity to order.");
            break;
        case quantity > availableQuantity:
            errors.push(`We do not have ${quantity} available.`);
    }

    return errors; // Add this line to return the array of errors
}

// Server listening on port 8080
app.listen(8080, () => console.log(`Listening on port 8080`));