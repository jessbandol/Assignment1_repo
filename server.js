const express = require('express');
const app = express();
const qs = require('querystring');
//const path = require('path');

// Middleware to log all requests
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});

// Serve static files from the public directory
app.use(express.static(__dirname + '/public'));

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Load product data
const products = require(__dirname + '/products.json');
//products.forEach( (prod,i) => {prod.total_sold = 0});

// Route for handling a GET request to "./products.js"
app.get('/products.js', function (request, response, next) {
    response.type('.js');
    let products_str = `let products = ${JSON.stringify(products)};`;
    response.send(products_str);
});


//ASSIGNMENT 2

// Read and parse user data
let user_data;
//let loginUsers = [];

const fs = require('fs');
// File paths
const filename = __dirname + '/user_data.json';
//const userDataPath = path.join(__dirname, 'user_data.json');

if (fs.existsSync(filename)) {
    let data = fs.readFileSync(filename, 'utf-8');
    user_data = JSON.parse(data);
    console.log(user_data);
    //let user_data_stats = fs.statSync(filename);
    //let stats_size = user_data_stats.size;
    //console.log(`The filename ${filename} has ${stats_size} characters`);
} else {
    console.log(`The file name ${filename} does not exist.`);
    user_data = {};
}

let temp_user = {};

/*
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
 */

 //sals pdpsp html
 app.post("/process_form", function(request, response) {
    let POST = request.body;
    let has_qty = false;
    let errorObject = {};

    for (let i in products) {
        let qty = POST[`qty${[i]}`];
        has_qty = has_qty || (qty > 0);

        let errorMessages = validateQuantity(qty, products[i].qty_available);

        if (errorMessages.length > 0) {
            errorObject[`qty${[i]}_error`] = errorMessages.join(', ');
        }
    }
    if (has_qty == false && Object.keys(errorObject).length == 0) {
        response.redirect("./products_display.html?error");
    }
    else if (has_qty == true && Object.keys(errorObject).length == 0) {
        for (let i in products) {
            temp_user[`qty${i}`] = POST[`qty${[i]}`];

        }
        let params = new URLSearchParams(temp_user);
        response.redirect(`./login.html?${params.toString()}`);
    }
    else if (Object.keys(errorObject).length > 0) {
        response.redirect("./products_display.html?" + qs.stringify(POST) + `&inputErr`);
    }
 });


//sals login
app.post('/process_login', function(request, response) {
    let POST = request.body; 
    let entered_email = POST['email'].toLowerCase();
    let entered_password = POST['password'];

    if(entered_email.length == 0 && entered_password == 0) {
        request.query.loginErr = 'Email address & password are both required.'
    } else if (user_data[entered_email]) {
        if (user_data[entered_email].password == entered_password) {
            temp_user['email'] = entered_email;
            temp_user['name'] = user_data[entered_email].name;

            let params = new URLSearchParams(temp_user);
            response.redirect(`/invoice.html?valid&${params.toString()}`);
            return;
        } else if (entered_password == 0) {
            request.query.loginErr = 'Password cannot be blank.';
        } else {
            request.query.loginErr = 'Incorrect password.';
        } 
    } else {
        request.query.loginErr = 'Invalid email.';
    }
    
    request.query.email = entered_email;
    let params = new URLSearchParams(request.query);
    response.redirect(`login.html?${params.toString()}`);

});

/*
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
            break;
    }

    return errors; // Add this line to return the array of errors
}

/*/
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
*/

//sals invoice 
app.post("/process_purchase", function(request, response) {

    let POST = request.body;
    let has_qty = false;
    let errorObject = {};

    for (let i in products) {
        let qty = POST[`qty${[i]}`];
        has_qty = has_qty || (qty > 0);

        let errorMessages = validateQuantity(qty, products[i].qty_available);

        if (errorMessages.length > 0) {
            errorObject[`qty${[i]}_error`] = errorMessages.join(', ');
        }
    }

    if (has_qty == false && Object.keys(errorObject).length == 0) {
        response.redirect("./products_display.html?error");
    }

    else if (has_qty == true && Object.keys(errorObject).length == 0) {
        for (let i in products) {
            temp_user[`qty${i}`] = POST[`qty${[i]}`];// add quantities to temp user data
            
        }
        // Store temp quantities desired in params
		let params = new URLSearchParams(temp_user);
	    response.redirect(`./login.html?${params.toString()}`);
		
    }

    else if (Object.keys(errorObject).length > 0) {
        response.redirect("./products_display.html?" + qs.stringify(POST) + `&inputErr`);
    }
});


app.post('/purchase_logout', function(request, response) {
	// Calculate inventory. Used to be in /process_purchase
	for (let i in products) {
		products[i].qty_sold += Number(temp_user[`qty${i}`]) || 0; 
		products[i].qty_available = Number(products[i].qty_available) - Number(temp_user[`qty${i}`]) || 0;
	}

	fs.writeFile(__dirname + '/products.json', JSON.stringify(products), 'utf-8', (err) => {
		if (err) {
			console.error('Error updating products data:', err);
		} else {
			console.log('Products data has been updated!');
		}
	});

	// Remove user information in temp_user
	delete temp_user['email'];
	delete temp_user['name'];

	response.redirect('/products_display.html?');
})

// Redirect user back to products_display.html
app.post('/continue_shopping', function(request, response) {
    let params = new URLSearchParams(temp_user);
    response.redirect(`/products_display.html?${params.toString()}`);
})

// Store registration erros; assume no errors at first
let registration_errors = {};

app.post('/register', function(request, response) {
	// Get user's inputs from registration form
	let reg_name = request.body.name;
	let reg_email = request.body.email.toLowerCase();
	let reg_password = request.body.password;
	let reg_confirm_passwaord = request.body.confirm_password;

	validateConfirmPassword(reg_confirm_passwaord, reg_password);
    // simplest validation; the rest need to be done too.

	// Server response
	if (Object.keys(registration_errors).length == 0) {
		// Make a new object in the user_data object
		user_data[reg_email] = {};
		user_data[reg_email].name = reg_name;
		user_data[reg_email].password = reg_password;

		// Asynchronously write the updated user_data and products to their respective files
        fs.writeFile(__dirname + '/user_data.json', JSON.stringify(user_data), 'utf-8', (err) => {
			if (err) {
				console.error('Error updating user data:', err);
				// You may want to send an error response to the user or handle it differently
			} else {
				console.log('User data has been updated!');

				// Add the user's info into temp_info
				temp_user['name'] = reg_name;
				temp_user['email'] = reg_email;
				
				// Console log check
				console.log(temp_user);
				console.log(user_data);

				let params = new URLSearchParams(temp_user);
				response.redirect(`/invoice.html?regSuccess&valid&${params.toString()}`);
			}
		}); 
	}
	else {
		delete request.body.password;
		delete request.body.confirm_password;
	
		let params = new URLSearchParams(request.body);
		response.redirect(`/register.html?${params.toString()}&${qs.stringify(registration_errors)}`);
	}
})

function validateConfirmPassword(confirm_password, password) {
	// Reset previous errors
    delete registration_errors['confirm_password_type'];
    
    console.log(registration_errors);

    if (confirm_password !== password) {
		registration_errors['confirm_password_type'] = 'Passwords do not match.';
	}
}


// Server listening on port 8080
app.listen(8080, () => console.log(`Listening on port 8080`));