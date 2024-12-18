const express = require('express');
const app = express();
const adminroute = require("./routes/adminroutes");
const profileroute = require("./routes/profileroutes");
const path = require('path');


const session = require('express-session');
app.use(session({
    secret: 'helodeepakji',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
    // cookie: {
    //     maxAge: 30 * 60 * 1000 // 30 minutes
    //   }
}))

app.use(express.static('public')); // 'public' folder mein static files rakhein


app.use((req, res, next) => {
    res.locals.authenticated = req.session.userId ? true : false;
    next();
});

app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies if necessary


app.use('/', adminroute);
app.use('/profile', profileroute);    

// Set the view engine to EJS
app.set('view engine', 'ejs');
// Set the views directory (optional, default is 'views' in the root directory)

// Set the views directory
app.set('views', path.join(__dirname, 'views')); // Adjust the path as needed

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
