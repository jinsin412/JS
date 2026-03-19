const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Products Endpoint
app.get('/api/products', (req, res) => {
    // Logic for fetching products from the database
    res.send('Fetching products...');
});

// Hospital Services Endpoint
app.get('/api/hospitals', (req, res) => {
    // Logic for fetching hospital services from the database
    res.send('Fetching hospital services...');
});

// Funeral Services Endpoint
app.get('/api/funeral-services', (req, res) => {
    // Logic for fetching funeral services from the database
    res.send('Fetching funeral services...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});