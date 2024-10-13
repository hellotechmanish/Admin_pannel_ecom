const express = require('express');
const route = express();
const db = require('../database_connection/database_con');
const bodyParser = require('body-parser');
route.use(bodyParser.urlencoded({ extended: true }));
route.use(bodyParser.json());
const bcrypt = require('bcrypt');
const { addProduct } = require('../controllers/adminController')


function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}


// Admin  route  
route.get('/', isAuthenticated, (req, res) => {
  const cartdetailsQuery = 'SELECT * FROM cartdetails';
  const OrderDetailsQuery = 'SELECT * FROM OrderDetails';
  const orderdeliveredQuery = 'SELECT * FROM orderdetails WHERE status = "Delivered"';

  // Execute the query to fetch data from cartdetails
  db.query(cartdetailsQuery, (err, cartDetailsresult) => {
    if (err) {
      console.error('Error fetching cart details:', err);
      return res.status(500).send('Error retrieving cart details');
    }
    db.query(OrderDetailsQuery, (err, OrderDetailsresult) => {
      if (err) {
        console.error('Error fetching cart details:', err);
        return res.status(500).send('Error retrieving cart details');
      }
      db.query(orderdeliveredQuery, (err, orderdeliveredresult) => {
        if (err) {
          console.error('Error fetching cart details:', err);
          return res.status(500).send('Error retrieving cart details');
        }

        // Render the 'Dashboard' view and pass the cart details data
        res.render('Dashboard', { cartDetails: cartDetailsresult, OrderDetails: OrderDetailsresult, orderdelivered: orderdeliveredresult }); // Ensure 'Dashboard' exists in views/admin
      });
    });
  });
});
route.post('/', (req, res) => {
  addProduct(req.body, (err, result) => {
    if (err) {
      console.error('Error adding product:', err);
      return res.status(500).json({ error: 'Failed to add product' });
    }
    // res.status(200).json({ message: 'Product added successfully', productId: result.insertId });
    res.redirect('/');
  });
});

route.get('/profile',isAuthenticated , (req, res) => {
  // console.log('Session:', req.session); // this is check how many data recive from session
  
  const loggedInUserId = req.session.userId; // Safely access user ID
  
  // Check if userId is available in the session
  if (!loggedInUserId) {
    console.error('User ID not found in session');
    return res.status(401).send('User not logged in');
  }
  console.log('Logged-in User ID:', loggedInUserId);

  
  // console.log('Session:', loggedInUserId.userId);

  // this qery for print data when we want data
  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [loggedInUserId], (err, userresult) => {
      if (err) {
          console.error('Error fetching user details:', err);
          return res.status(500).send('Error retrieving user details');
      }

      if (userresult.length > 0) {
          res.render('profile', { userdata: userresult[0] });
      } else {
          res.status(404).send('User not found');
      }
  });
});

// Login  route
route.get('/login', (req, res) => {
  // Render the dashboard with all results
  res.render('login');
});
route.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  // Check email in the database
  const query = 'SELECT * FROM users WHERE email  = ?';
  db.query(query, [email], (err, results) => {

    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send('Internal server error in sql'); // Return after sending the response
    }

    if (results.length === 0) {
      // If the email is not found
      return res.status(401).send('Invalid  email or password in ! avail in sql'); // Return after sending the response
    }

    // Get the user object from the database query
    const user = results[0];
    //  res.json(user);
    //  console.log('Stored Hashed Password:', user.password); // Log the stored hashed password

    // Compare the provided password with the stored hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      console.log('Password:', password);
      console.log('Stored Hashed Password:', user.password);
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).send('Internal server error');
      }

      if (!isMatch) {
        return res.status(401).send('Invalid  password'); // Passwords don't match
      }

      req.session.userId = user.id;
      // req.session.user = {
      //     id: user.id,
      //     username: user.username,
      //     email: user.email,
      //     number: user.number,
      // };

      res.redirect('/');
      // If email and password are correct
      // res.send('Login successful');
      // res.redirect('/',{user: results} );
    });
  });

});

route.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check email in the database
  const query = 'SELECT * FROM users WHERE email  = ?';
  db.query(query, [email], (err, results) => {

    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send('Internal server error'); // Avoid too much detail in error messages
    }

    if (results.length === 0) {
      // If the email is not found
      return res.status(401).send('Invalid credentials'); // Generalized message
    }

    // Get the user object from the database query
    const user = results[0];

    // Compare the provided password with the stored hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {

      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).send('Internal server error');
      }

      if (!isMatch) {
        return res.status(401).send('Invalid credentials'); // Generalized message
      }

      // Store user session details
      req.session.userId = user.id;

      // Redirect to home page
      res.redirect('/');
    });
  });
});




// Login  route
route.get('/signup', (req, res) => {
  // Render the dashboard with all results
  res.render('signup');

});
route.post('/signup', async (req, res) => {
  const { username, email, number, password } = req.body;
  // Input validation
  if (!username || !email || !number || !password) {
    return res.status(400).send('All fields are required');
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(username, email, number, hashedPassword);
  const query = `INSERT INTO users (username, email, number, password) VALUES (?, ?, ?, ?)`;
  db.query(query, [username, email, number, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).send('Error inserting user');
    }
    // res.send('User signup successful');
    res.redirect('login')
  });
});



route.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    // res.send('Logged out successfully');
    res.redirect('login');
  });
});


module.exports = route;