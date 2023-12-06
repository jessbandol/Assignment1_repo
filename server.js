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
let loginUsers = [];

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
//app.use(express.json());

// Serve static files from the public directory
app.use(express.static(__dirname + '/public'));

// Load product data
let products = require(__dirname + '/products.json');
products.forEach( (prod,i) => {prod.total_sold = 0});

/*
// Declare selectedQuantities outside of any route handler
let selectedQuantities = [];
let POST = {};
*/

// Route for handling a GET request to "./products.js"
app.get('/products.js', function (request, response, next) {
    response.type('.js');
    let products_str = `let products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

/*
// Route to get dummy user data
app.get('/api/user-data', function (request, response) {
    const userData = { username: 'testuser', email: 'testuser@example.com' };
    response.json(userData);
});
*/

//opening invoice not through the purhcase page
app.get('/invoice.html', function (request, response) {
    let username_input = request.query['username'];

    //if the username is in the signed in, they would be in the array, send them 
    if(loginUsers.includes(username_input)){
        response.sendFile(__dirname + '/public/invoice.html'); 
    
    }
    else{
        //if not, bring them to the store with an error so they can make a purchase
        response.redirect(
            `/products_display.html?&error=true`
          );
    }
});

// Initialize product quantities
for (let i in products) {
    products[i].qty_sold = 0; // Adding qty_sold=0 to each product
}

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

/*
// Load user data
let userData = loadUserData();
console.log('User data:', userData);
*/

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

/*
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
*/

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

/*
// Function to handle login errors and send a JSON response
function handleLoginError(response, errorMessage, formData) {
    // Update login error message
    formData.loginError = errorMessage;

    // Send a JSON response with an error property
    response.status(400).json({ success: false, error: errorMessage });
}
*/

// Route for processing login
app.post('/login', function (request, response) {
    //fills params
    let email_input = request.body['email'];
    let password_input = request.body['password'];
    let orderParams = request.body['order'];
    let response_msg = '';
    let errors = false;

    //generate the url for the order
    let url = generateProductURL(orderParams);

    //if there is an account, check if passwords
    if (user_reg_data[email_input.toLowerCase()]) {
        let storedUserData = user_reg_data[email_input.toLowerCase()];

        // Verify the provided password against the stored hash and salt
        const passwordMatch = verifyPassword(
            password_input,
            storedUserData.salt,
            storedUserData.password
        );

        if (passwordMatch) {
            // Add the username to loginUsers
            if (!loginUsers.includes(email_input)) {
                loginUsers.push(email_input);
            }

            // Construct JSON response with redirect URL
            const jsonResponse = {
                success: true,
                redirectURL: `/invoice.html?${url}&email=${email_input}&totalOnline=${loginUsers.length}&email=${storedUserData.email}`,
            };

            // Send the JSON response
            response.json(jsonResponse);
            return; // Ensure that the function exits after redirecting
        } else {
            // Construct JSON response with error message
            const jsonResponse = {
                success: false,
                error: 'Incorrect Password',
            };

            // Send the JSON response
            response.json(jsonResponse);
        }
    } else {
        response_msg = `${email_input} does not exist`;

        // Construct JSON response with error message
        const jsonResponse = {
            success: false,
            error: response_msg,
        };

        // Send the JSON response
        response.json(jsonResponse);
    }
});

/*
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
                response.redirect(`/invoice.html?valid&${redirectURL}`);
                console.log('Successful login. Redirecting...');
                return;
            } else {
                // Log an error if selectedQuantities is not an array
                console.error('selectedQuantities is not an array:', selectedQuantities);
                response.status(500).send('Internal Server Error');
                return;
            }
        } else {
            // Password does not match
            return handleLoginError(response, 'Invalid password.', formData);
        }
    } else {
        // Email does not match an existing user
        return handleLoginError(response, 'Invalid email address.', formData);
    }

     // Function to handle login errors and redirect back to login.html
     function handleLoginError(response, errorMessage, formData) {
        // Update login error message
        formData.loginError = errorMessage;

        // Send a JSON response with an error property
        response.status(400).json({ success: false, error: errorMessage });
    }
});

// Function to handle login errors and redirect back to login.html
function handleLoginError(response, errorMessage, formData) {
    // Update login error message
    formData.loginError = errorMessage;

    // Redirect back to login.html with params for login error and sticky email address
    return response.redirect(`/login.html?${qs.stringify(formData)}`);
}
*/

//redirects user to register with the order in the url
app.post("/toRegister", function (request, response) {
    let orderParams = request.body['order'];
    //console.log(orderParams);
    let url = generateProductURL(orderParams);

    response.redirect(`/register.html?`+url);
});

//redirects user to login with the order in the url
app.post("/toLogin", function (request, response) {
  let orderParams = request.body['order'];
  //console.log(orderParams);
  let url = generateProductURL(orderParams);

  response.redirect(`/login.html?`+url);
});

//this is the register when a user wants to register
app.post('/register', function (request, response) {
    let errorString = '';
  
    //generate url string from order
    let orderParams = request.body['order'];
    console.log(orderParams);
    if (orderParams) {
        let jsonData;
        try {
            jsonData = JSON.parse(orderParams);
        } catch (e) {
            console.error(e);
        }
        let url = generateProductURL(jsonData); // Use jsonData instead of orderParams if necessary
    } else {
        console.error('orderParams is undefined');
    }

    let url = generateProductURL(orderParams);
    
    // Validate email address
    const existingEmail = Object.keys(user_reg_data).find(
        (email) => email.toLowerCase() === request.body.email.toLowerCase()
      );
    //if the email exists
    if (existingEmail) {
      errorString += 'Email Address Already Exists! ';
    }
    // if the email does not follow formatting requirements 
    if (!/^[A-Za-z0-9_.]+@[A-Za-z0-9.]{2,}\.[A-Za-z]{2,3}$/.test(request.body.email)) {
      errorString += 'Invalid Email Address Format! ';
    }
  
    // Validate password
    if (request.body.password !== request.body.repeat_password) {
      errorString += 'Passwords Do Not Match! ';
    }
  
    //if there are no errors, start the user creation proccess
    if (errorString === '') {
      const new_user = request.body.email.toLowerCase();
  
      // Consulted Chet and some external sites on salt and hashing
      const { salt, hash } = hashPassword(request.body.password);
    
      user_reg_data[new_user] = {
        password: hash, // Store the hashed password
        salt: salt,     // Store the salt
        username: request.body.username,
        email: request.body.email.toLowerCase(), 

      };
      loginUsers.push(new_user);
      // Write user data to file
      fs.writeFileSync(filename, JSON.stringify(user_reg_data), 'utf-8');
      //bring them to the invoice
      response.redirect(`/invoice.html?`+ url + `&username=${new_user}`+`&totalOnline=${loginUsers.length}`+`&email=${request.body.email}`);
    } else {
      //send them to register with the url and the information to make it sticky along with the error
      response.redirect(`/register.html?`+ url +`&username=${request.body.username}&email=${request.body.email}&error=${errorString}`);
    }
  });
  

// Handle the 'Continue Shopping' post request
app.post('/continue_shopping', (req, res) => {
    // Redirect to products_display page and let the user select more quantities or products while keeping previously selected quantities
    res.redirect('/products_display.html');
});

//returns user to purchase with email and username in params for personalization and the order for stickyness
app.post("/return_to_store", function (request, response) {
    let username = request.body[`username`];
    let orderParams = request.body['order'];

    let url = generateProductURL(orderParams);

    response.redirect(`/products_display.html?`+ url + `&username=${username}` + `&totalOnline=${loginUsers.length}`+`&email=${request.body.email}`);

});

//update the total sold and quantity avalible 
app.post("/complete_purchase", function (request, response) {
    let orderParams = request.body['order'];
    let orderArray = JSON.parse(orderParams);
    let username = request.body['username'];
    for (i in orderArray)
        {
            //update total and qty only if everything is good
            products[i]['total_sold'] += orderArray[i];
            products[i]['qty_available'] -= orderArray[i];
        }
        //log out user
        loginUsers.pop(username);
        //console.log(loginUsers);
    response.redirect('/index.html?&thankYou=true');
});

//whenever a post with proccess form is recieved
app.post("/process_form", function (request, response) {

    let username = request.body[`username`];
    //console.log(loginUsers);
    //get the textbox inputs in an array
    let qtys = [];
    for (let i = 0; i < products.length; i++) {
        let quantityValue = request.body[`quantity${i}`];
        qtys.push(Number(quantityValue));
    }
    //console.log(request.body)
    //initially set the valid check to true
    let valid = true;
    //instantiate an empty string to hold the url
    let url = '';
    let soldArray =[];

    //for each member of qtys
    for (i in qtys) {
        
        //set q as the number
        let q = Number(qtys[i]);
        
        //console.log(validateQuantity(q));
        //if the validate quantity string is empty
        if (validateQuantity(q)=='') {
            //check if we will go into the negative if we buy this, set valid to false if so
            if(products[i]['qty_available'] - Number(q) < 0){
                valid = false;
                url += `&prod${i}=${q}`
            }
            // otherwise, add to total sold, and subtract from available
            else{
               
                soldArray[i] = Number(q);
                
                //add argument to url
                url += `&prod${i}=${q}`
            }
            
            
        }
        //if the validate quantity string has stuff in it, set valid to false
         else {
            
            valid = false;
            url += `&prod${i}=${q}`
        }
        //check if no products were bought, set valid to false if so
        if(url == `&prod0=0&prod1=0&prod2=0&prod3=0&prod4=0&prod5=0`){
            valid = false
        }
    }

    //if its false, return to the store with error=true
    if(valid == false)
    {
        response.redirect(`products_display.html?error=true` + url + `&username=${username}`+ `&totalOnline=${loginUsers.length}`+`&email=${request.body.email}`);
    }
    //otherwise, redirect to the invoice with the url attached
    else{

        const lowercaseArray = loginUsers.map(item => item.toLowerCase());
        const lowercaseSearchString = username.toLowerCase();

        if (lowercaseArray.includes(lowercaseSearchString)) {
        
            response.redirect('invoice.html?' + url + `&username=${username}`+`&totalOnline=${loginUsers.length}`+`&email=${request.body.email}`);
        
        }
        else{

            response.redirect('login.html?' + url + '&error=&username=');
        }
    }
 });

//generate the salt and hash for the password provided
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex'); // Generate a random salt
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return { salt, hash };
  }
  
  // Function to verify a password against a hash and salt
  function verifyPassword(password, salt, storedHash) {
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === storedHash;
  }

 /*
//Route to get user data for testing
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
*/

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

/*
function generateProductURL(orderString){
    let orderArray = JSON.parse(orderString);
    let orderURL = ``;
    for(i in orderArray){
        orderURL += `&prod${i}=${orderArray[i]}`

    }
    return orderURL;
}
*/

function generateProductURL(orderParams) {
    // Check if orderParams is undefined or null
    if (orderParams === undefined || orderParams === null) {
        return '';
    }

    let orderArray;
    try {
        orderArray = JSON.parse(orderParams);
    } catch (e) {
        console.error(e);
        return '';
    }

    let orderURL = '';
    for (let i in orderArray) {
        orderURL += `&prod${i}=${orderArray[i]}`;
    }
    
    return orderURL;
}

// Server listening on port 8080
app.listen(8080, () => console.log(`Listening on port 8080`));