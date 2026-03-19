const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Sample data
let products = [];
let hospitals = [];
let reservations = [];
let inquiries = [];
let memorials = [];

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).send('Health check OK');
});

// Products Endpoints
app.get('/products', (req, res) => {
    res.json(products);
});

app.post('/products', (req, res) => {
    const product = req.body;
    products.push(product);
    res.status(201).json(product);
});

app.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = req.body;
        res.json(products[index]);
    } else {
        res.status(404).send('Product not found');
    }
});

app.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    products = products.filter(p => p.id !== id);
    res.status(204).send();
});

// Hospitals Endpoints
app.get('/hospitals', (req, res) => {
    res.json(hospitals);
});

app.post('/hospitals', (req, res) => {
    const hospital = req.body;
    hospitals.push(hospital);
    res.status(201).json(hospital);
});

// Search functionality for hospitals
app.get('/hospitals/search', (req, res) => {
    const { name } = req.query;
    const filteredHospitals = hospitals.filter(h => h.name.includes(name));
    res.json(filteredHospitals);
});

// Reservations Endpoints
app.post('/reservations', (req, res) => {
    const reservation = req.body;
    reservations.push(reservation);
    res.status(201).json(reservation);
});

// Inquiries Endpoints
app.post('/inquiries', (req, res) => {
    const inquiry = req.body;
    inquiries.push(inquiry);
    res.status(201).json(inquiry);
});

// Memorials Endpoints
app.post('/memorials', (req, res) => {
    const memorial = req.body;
    memorials.push(memorial);
    res.status(201).json(memorial);
});

app.get('/memorials', (req, res) => {
    res.json(memorials);
});

app.delete('/memorials/:id', (req, res) => {
    const { id } = req.params;
    memorials = memorials.filter(m => m.id !== id);
    res.status(204).send();
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});