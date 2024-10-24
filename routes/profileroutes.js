const express = require('express');
const route = express();
const db = require('../database_connection/database_con');



function isAuthenticated(req, res, next) {
    if (req.session.userId) {
      next();
    } else {
      res.redirect('/login');
    }
  }

route.get('/', isAuthenticated, (req, res) => {
    // console.log('Session:', req.session); // this is check how many data recive from session
  
    const loggedInUserId = req.session.userId; // Safely access user ID
  
    // Check if userId is available in the session
    if (!loggedInUserId) {
      console.error('User ID not found in session');
      return res.status(401).send('User not logged in');
    }
    console.log('Logged-in User ID:', loggedInUserId);
  
    console.log('Session:', loggedInUserId.userId);
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


route.get('/update',isAuthenticated , (req,res)=>{
  const loggedInUserId = req.session.userId; // Safely access user ID
  if (!loggedInUserId) {
    return res.redirect('/login');  // If no userId in session, redirect to login
}
  
  const userdataquery = 'SELECT * FROM users where id = ?';
  db.query(userdataquery,[loggedInUserId], (err, userdataresult) => {
    if (err) {
      console.error('Error fetching user details:', err);
      return res.status(500).send('Error retrieving uaers details');
    }
    // Render the 'update' view and pass the cart details data
    res.render('update', { userdata: userdataresult[0] }); 
  });  
  });

  // post route profile page
  route.post('/update', isAuthenticated, (req, res) => {
    const { username, email, number, project,address } = req.body;
    console.log(username);
    const loggedInUserId = req.session.userId; // Safely access user ID
    // Check if userId is available in the session
    if (!loggedInUserId) {
      console.error('User ID not found in session');
      return res.status(401).send('User not logged in');
    }
    console.log('Logged-in User ID:', loggedInUserId);
  
    // SQL Query to insert product into the product table
    const getusers = `UPDATE users SET username = ?, email = ?, number = ?,project = ?,address = ? WHERE id = ?`;
  db.query(getusers, [username, email, number, project, address , loggedInUserId], (err, getusersresult) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).send('Error inserting user');
    }
    // console.log(getusersresult);
    res.redirect('/profile');
  
  });
  
  });

//   route.get('/logout', (req, res) => {
//     req.session.destroy((err) => {
//       if (err) {
//         return res.status(500).send('Error logging out');
//       }
//       // res.send('Logged out successfully');
//       res.redirect('login');
//     });
//   });















module.exports = route;