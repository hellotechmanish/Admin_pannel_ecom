
const db = require('../database_connection/database_con'); // Database connection

// Function to add product
const addProduct = (productData, callback) => {
    const { productName, price, productType, quantity, category, description } = productData;

    // SQL Query to insert product into the product table
    const query = `
        INSERT INTO allproduct (product_name, price, product_type, quantity, category, description)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Execute query and call the callback function
    db.query(query, [productName, price, productType, quantity, category, description], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, result);
    });
};

module.exports = { addProduct };
